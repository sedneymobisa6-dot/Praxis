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

  // 1. Verify the user is a Lead
  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('role')
    .eq('user_id', ctx.userId)
    .eq('firm_id', ctx.firmId)
    .single();

  if (!firmUser || firmUser.role !== 'lead') {
    return NextResponse.json(
      { error: 'Only a Lead can delete a client' },
      { status: 403 }
    );
  }

  // 2. Verify the client belongs to this firm and get their name for the log
  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // 3. Delete the client (Cascade will handle DSARs, Breaches, etc.)
  const { error: deleteError } = await supabase
    .from('clients')
    .delete()
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // 4. Log the deletion to the audit trail
  await supabase.from('audit_log').insert({
    firm_id: ctx.firmId,
    client_id: null, // Since the client is deleted, we nullify this to avoid FK issues
    user_id: ctx.userId,
    action: 'client_deleted',
    entity_type: 'clients',
    entity_id: params.id,
    metadata: { client_name: client.name },
  });

  return NextResponse.json({ ok: true });
}