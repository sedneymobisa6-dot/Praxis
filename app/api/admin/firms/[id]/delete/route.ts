import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  // 1. Verify the caller is a Platform Admin
  const { data: admin } = await supabase
    .from('platform_admins')
    .select('id, email')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  // 2. Fetch the firm to get its name for the permanent log
  const { data: firm } = await supabase
    .from('firms')
    .select('id, name')
    .eq('id', params.id)
    .maybeSingle();

  if (!firm) {
    return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server is misconfigured (missing service role key)' },
      { status: 500 }
    );
  }

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // 3. Write to the PLATFORM audit log (this survives the firm deletion)
  await adminClient.from('platform_audit_log').insert({
    admin_user_id: user.id,
    admin_email: user.email ?? null,
    action: 'firm_deleted_permanently',
    firm_id: firm.id,
    firm_name: firm.name,
    metadata: {
      deleted_at: new Date().toISOString(),
    },
  });

  // 4. Delete the firm (Cascade will handle firm_users, clients, audit_log, etc.)
  const { error: deleteError } = await adminClient
    .from('firms')
    .delete()
    .eq('id', firm.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}