import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

type RequestBody = {
  firmName?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerEmail?: string;
  ownerName?: string;
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
  const contactEmail = (body.contactEmail ?? '').trim() || ownerEmail;
  const contactPhone = (body.contactPhone ?? '').trim();
  const sector = (body.sector ?? 'other').trim();

  if (!firmName || !ownerEmail) {
    return NextResponse.json(
      { error: 'Firm name and owner email are required' },
      { status: 400 }
    );
  }

  const tier = body.tier ?? 'starter';
  const clientLimit =
    typeof body.clientLimit === 'number' ? body.clientLimit : 5;
  const monthlyFee =
    typeof body.monthlyFee === 'number' ? body.monthlyFee : 10000;

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: firm, error: firmError } = await adminClient
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

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://praxis-beta-five.vercel.app';

  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    ownerEmail,
    {
      data: {
        firm_id: firm.id,
        full_name: ownerName,
        role: 'owner',
        sector: sector,
        skip_auto_firm: true,
      },
      redirectTo: siteUrl + '/firm/dashboard',
    }
  );

  if (inviteError) {
    await adminClient.from('firms').delete().eq('id', firm.id);
    return NextResponse.json(
      { error: inviteError.message },
      { status: 500 }
    );
  }

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
      tier: tier,
      client_limit: clientLimit,
      monthly_fee_kes: monthlyFee,
    },
  });

  return NextResponse.json({ ok: true, firmId: firm.id });
}