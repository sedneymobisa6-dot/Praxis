import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFirmContext } from '@/lib/auth/firmContext';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getFirmContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const supabase = createClient();

  // 1. Verify the caller is a Lead
  const { data: callerRow } = await supabase
    .from('firm_users')
    .select('role')
    .eq('user_id', ctx.userId)
    .eq('firm_id', ctx.firmId)
    .single();

  if (!callerRow || callerRow.role !== 'lead') {
    return NextResponse.json(
      { error: 'Only a Lead can remove team members' },
      { status: 403 }
    );
  }

  // 2. Fetch the target team member
  const { data: targetMember } = await supabase
    .from('firm_users')
    .select('id, user_id, full_name, role')
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!targetMember) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
  }

  // 3. Prevent the Lead from deleting themselves
  if (targetMember.user_id === ctx.userId) {
    return NextResponse.json(
      { error: 'You cannot remove yourself from the firm' },
      { status: 400 }
    );
  }

  // 4. Delete the firm_users row
  const { error: deleteError } = await supabase
    .from('firm_users')
    .delete()
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // 5. Log the action
  await supabase.from('audit_log').insert({
    firm_id: ctx.firmId,
    client_id: null,
    user_id: ctx.userId,
    action: 'team_member_removed',
    entity_type: 'firm_users',
    entity_id: params.id,
    metadata: {
      removed_user_id: targetMember.user_id,
      removed_user_name: targetMember.full_name,
      removed_user_role: targetMember.role,
    },
  });

  return NextResponse.json({ ok: true });
}