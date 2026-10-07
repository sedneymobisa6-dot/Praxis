import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

type RequestBody = {
  firmName?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerEmail?: string;
  ownerName?: string;
  ownerPassword?: string;
  sector?: string;
  tier?: string;
  clientLimit?: number;
  monthlyFee?: number;
};

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from('platform_admins')
    .select('id, email')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const firmName = (body.firmName ?? '').trim();
  const ownerEmail = (body.ownerEmail ?? '').trim().toLowerCase();
  const ownerName = (body.ownerName ?? '').trim();
  const ownerPassword = body.ownerPassword ?? '';
  const contactEmail = (body.contactEmail ?? '').trim() || ownerEmail;
  const contactPhone = (body.contactPhone ?? '').trim();
  const sector = (body.sector ?? 'other').trim();

  if (!firmName || !ownerEmail) {
    return NextResponse.json(
      { error: 'Firm name and owner email are required' },
      { status: 400 }
    );
  }

  if (ownerPassword.length < 8) {
    return NextResponse.json(
      { error: 'Owner password must be at least 8 characters' },
      { status: 400 }
    );
  }

  const tier = body.tier ?? 'starter';
  const clientLimit =
    typeof body.clientLimit === 'number' ? body.clientLimit : 5;
  const monthlyFee =
    typeof body.monthlyFee === 'number' ? body.monthlyFee : 10000;

  // Use the authenticated admin session for the firm insert.
  // RLS policy "Platform admins can insert firms" allows this.
  const { data: firm, error: firmError } = await supabase
    .from('firms')
    .insert({
      name: firmName,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      subscription_status: 'active',
      tier: tier,
      client_limit: clientLimit,
      monthly_fee_kes: monthlyFee,
      billing_start_date: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (firmError || !firm) {
    return NextResponse.json(
      { error: firmError?.message ?? 'Could not create firm' },
      { status: 500 }
    );
  }

  // Now use the service role client for the auth user creation.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    await supabase.from('firms').delete().eq('id', firm.id);
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

  // Refuse if a user with this email already exists.
  const { data: existingUserId } = await adminClient.rpc(
    'get_user_id_by_email',
    { target_email: ownerEmail }
  );

  if (existingUserId) {
    await supabase.from('firms').delete().eq('id', firm.id);
    return NextResponse.json(
      {
        error:
          'A user with this email already exists. Use the Team page from an existing firm, or choose a different email.',
      },
      { status: 400 }
    );
  }

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: {
        full_name: ownerName,
        skip_auto_firm: true,
      },
    });

  if (createError || !created.user) {
    await supabase.from('firms').delete().eq('id', firm.id);
    return NextResponse.json(
      { error: createError?.message ?? 'Could not create owner account' },
      { status: 500 }
    );
  }

  // Insert the firm_users row as the first Lead.
  // Use service role so RLS does not block when the user has no session yet.
  const { error: firmUserError } = await adminClient
    .from('firm_users')
    .insert({
      firm_id: firm.id,
      user_id: created.user.id,
      full_name: ownerName || null,
      role: 'lead',
      must_change_password: true,
      is_active: true,
    });

  if (firmUserError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    await supabase.from('firms').delete().eq('id', firm.id);
    return NextResponse.json({ error: firmUserError.message }, { status: 500 });
  }

  // Log to both audit logs.
  await adminClient.from('audit_log').insert({
    firm_id: firm.id,
    user_id: user.id,
    action: 'firm_created_by_admin',
    entity_type: 'firms',
    entity_id: firm.id,
    is_admin_action: true,
    metadata: {
      firm_name: firmName,
      owner_email: ownerEmail,
      owner_name: ownerName,
      tier: tier,
      client_limit: clientLimit,
      monthly_fee_kes: monthlyFee,
    },
  });

  await adminClient.from('platform_audit_log').insert({
    admin_user_id: user.id,
    admin_email: user.email ?? null,
    action: 'firm_created',
    firm_id: firm.id,
    firm_name: firmName,
    metadata: {
      owner_email: ownerEmail,
      owner_name: ownerName,
      tier: tier,
      client_limit: clientLimit,
      monthly_fee_kes: monthlyFee,
    },
  });

  return NextResponse.json({
    ok: true,
    firmId: firm.id,
    ownerEmail: ownerEmail,
    ownerPassword: ownerPassword,
  });
}