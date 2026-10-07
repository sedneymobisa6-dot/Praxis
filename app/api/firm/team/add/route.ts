import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

type RequestBody = {
  fullName?: string;
  email?: string;
  role?: string;
  password?: string;
};

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  // Caller must be a lead in their current firm.
  const { data: callerRow } = await supabase
    .from('firm_users')
    .select('firm_id, role')
    .eq('user_id', user.id)
    .order('is_active', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!callerRow || callerRow.role !== 'lead') {
    return NextResponse.json(
      { error: 'Only a lead can add team members' },
      { status: 403 }
    );
  }

  const firmId = callerRow.firm_id;

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const fullName = (body.fullName ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();
  const role = (body.role ?? '').trim();
  const password = body.password ?? '';

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  if (role !== 'manager' && role !== 'operator') {
    return NextResponse.json(
      { error: 'Role must be manager or operator' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
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

  // Look up existing user by email.
  const { data: existingUserId, error: lookupError } = await adminClient.rpc(
    'get_user_id_by_email',
    { target_email: email }
  );

  if (lookupError) {
    return NextResponse.json(
      { error: 'Could not look up user: ' + lookupError.message },
      { status: 500 }
    );
  }

  let userId: string;

  if (existingUserId) {
    // User exists. Check they are not already in this firm.
    const { data: existingMember } = await adminClient
      .from('firm_users')
      .select('id')
      .eq('user_id', existingUserId)
      .eq('firm_id', firmId)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: 'This person is already part of your team' },
        { status: 400 }
      );
    }

    userId = existingUserId;
  } else {
    // Create the new user with the lead chosen password.
    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          skip_auto_firm: true,
        },
      });

    if (createError || !created.user) {
      return NextResponse.json(
        { error: createError?.message ?? 'Could not create user' },
        { status: 500 }
      );
    }

    userId = created.user.id;
  }

  // Insert firm_users row. Only set must_change_password for newly created users.
  const { error: insertError } = await adminClient
    .from('firm_users')
    .insert({
      firm_id: firmId,
      user_id: userId,
      full_name: fullName || null,
      role: role,
      must_change_password: !existingUserId,
      is_active: false,
    });

  if (insertError) {
    // Rollback new user if we created one.
    if (!existingUserId) {
      await adminClient.auth.admin.deleteUser(userId);
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await adminClient.from('audit_log').insert({
    firm_id: firmId,
    client_id: null,
    user_id: user.id,
    action: 'team_member_added',
    entity_type: 'firm_users',
    entity_id: userId,
    metadata: {
      email: email,
      full_name: fullName,
      role: role,
      was_existing_user: Boolean(existingUserId),
    },
  });

  return NextResponse.json({ ok: true, userId });
}