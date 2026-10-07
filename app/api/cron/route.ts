import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

type CertificateRow = {
  id: string;
  client_id: string;
  firm_id: string;
  certificate_number: string | null;
  issued_at: string | null;
  expires_at: string;
  clients: { id: string; name: string; contact_email: string | null }[] | null;
  firms: { id: string; name: string; contact_email: string | null }[] | null;
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: certificates, error } = await supabase
    .from('client_certificates')
    .select(`
      id,
      client_id,
      firm_id,
      certificate_number,
      issued_at,
      expires_at,
      clients ( id, name, contact_email ),
      firms ( id, name, contact_email )
    `)
    .not('expires_at', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  let sent = 0;
  let skipped = 0;

  const rows = (certificates ?? []) as unknown as CertificateRow[];

  for (const cert of rows) {
    const expiresAt = new Date(cert.expires_at).getTime();
    const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    let threshold: number | null = null;
    if (daysLeft <= 7 && daysLeft > 0) threshold = 7;
    else if (daysLeft <= 30 && daysLeft > 7) threshold = 30;
    else if (daysLeft <= 60 && daysLeft > 30) threshold = 60;

    if (threshold === null) {
      continue;
    }

    const client = cert.clients?.[0] ?? null;
    const firm = cert.firms?.[0] ?? null;

    const recipient =
      firm?.contact_email || client?.contact_email || null;

    if (!recipient) {
      skipped++;
      continue;
    }

    const { data: existing } = await supabase
      .from('email_log')
      .select('id')
      .eq('firm_id', cert.firm_id)
      .eq('client_id', cert.client_id)
      .eq('template', 'renewal_reminder_' + threshold)
      .gte('sent_at', new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    const clientName = client?.name ?? 'Your client';
    const firmName = firm?.name ?? 'Praxis';

    const subject =
      'Praxis Reminder: ' + clientName + ' certificate expires in ' + daysLeft + ' days';

    const body =
      'Dear ' +
      firmName +
      ',\n\n' +
      'The ODPC certificate of registration for ' +
      clientName +
      ' expires in ' +
      daysLeft +
      ' days, on ' +
      new Date(cert.expires_at).toLocaleDateString('en-GB') +
      '.\n\n' +
      'A renewal must be filed using Form DPR 2 before the expiry date. ' +
      'Continued processing of personal data after expiry is an offence under ' +
      'the Data Protection Act, 2019.\n\n' +
      'Review the renewal checklist here:\n' +
      'https://praxis-beta-five.vercel.app/firm/clients/' +
      cert.client_id +
      '\n\n' +
      'Regards,\n' +
      'Praxis';

    let sendStatus = 'sent';
    let providerMessageId: string | null = null;
    let errorMessage: string | null = null;

    if (RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + RESEND_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Praxis <onboarding@resend.dev>',
            to: [recipient],
            subject: subject,
            text: body,
          }),
        });

        if (!resendRes.ok) {
          sendStatus = 'failed';
          errorMessage = 'Resend returned ' + resendRes.status;
        } else {
          const resendJson = await resendRes.json().catch(() => null);
          providerMessageId = resendJson?.id ?? null;
        }
      } catch (err: any) {
        sendStatus = 'failed';
        errorMessage = err?.message ?? 'Unknown error';
      }
    } else {
      sendStatus = 'skipped_no_api_key';
    }

    await supabase.from('email_log').insert({
      firm_id: cert.firm_id,
      client_id: cert.client_id,
      recipient: recipient,
      subject: subject,
      template: 'renewal_reminder_' + threshold,
      status: sendStatus,
      provider_message_id: providerMessageId,
      error_message: errorMessage,
    });

    await supabase.from('audit_log').insert({
      firm_id: cert.firm_id,
      client_id: cert.client_id,
      action: 'renewal_reminder_sent',
      entity_type: 'client_certificates',
      entity_id: cert.id,
      metadata: { days_left: daysLeft, threshold: threshold },
    });

    if (sendStatus === 'sent') {
      sent++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, sent: sent, skipped: skipped });
}