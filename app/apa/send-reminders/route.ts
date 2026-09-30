import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: schools, error } = await supabase
    .from('schools')
    .select('id, school_name, email, tenant_id, certificate_expires_at')
    .not('certificate_expires_at', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  let sent = 0;

  for (const school of schools ?? []) {
    const expiresAt = new Date(school.certificate_expires_at).getTime();
    const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    let threshold: number | null = null;
    if (daysLeft <= 7 && daysLeft > 0) threshold = 7;
    else if (daysLeft <= 30 && daysLeft > 7) threshold = 30;
    else if (daysLeft <= 60 && daysLeft > 30) threshold = 60;

    if (threshold === null) continue;
    if (!school.email) continue;

    const subject =
      'Praxis Reminder: ODPC certificate expires in ' + daysLeft + ' days';

    const body =
      'Dear ' +
      school.school_name +
      ',\n\n' +
      'Your ODPC certificate of registration expires in ' +
      daysLeft +
      ' days (on ' +
      new Date(school.certificate_expires_at).toLocaleDateString('en-GB') +
      ').\n\n' +
      'You must renew before this date. Continued processing of personal data ' +
      'after expiry is an offence under the Data Protection Act 2019.\n\n' +
      'Log in to Praxis to review your renewal checklist:\n' +
      'https://praxis-beta-five.vercel.app/dashboard\n\n' +
      'Regards,\nPraxis';

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + RESEND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Praxis <onboarding@resend.dev>',
          to: [school.email],
          subject: subject,
          text: body,
        }),
      });
    }

    await supabase.from('audit_log').insert({
      tenant_id: school.tenant_id,
      action: 'renewal_reminder_sent',
      entity_type: 'schools',
      entity_id: school.id,
      metadata: { days_left: daysLeft, threshold: threshold },
    });

    sent++;
  }

  return NextResponse.json({ ok: true, sent: sent });
}