import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFirmContext } from '@/lib/auth/firmContext';

const ODPC_BLUE = '#0A3D62';

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getFirmContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const supabase = createClient();
  const url = new URL(request.url);
  const asWord = url.searchParams.get('format') === 'word';

  const { data: breach } = await supabase
    .from('client_breaches')
    .select('*, clients(name, postal_address, contact_phone, contact_email)')
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!breach) {
    return NextResponse.json({ error: 'Breach not found' }, { status: 404 });
  }

  const client = (breach as any).clients;
  const clientName = client?.name ?? 'Your Organisation';
  const clientAddress = client?.postal_address ?? '';
  const clientPhone = client?.contact_phone ?? '';
  const clientEmail = client?.contact_email ?? '';

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const discoveredAt = new Date(breach.discovered_at).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const referenceNumber = 'BREACH/DS/' + params.id.substring(0, 8).toUpperCase();

  const causeLine = breach.breach_cause
    ? '<p><strong>What caused the breach:</strong> ' + escapeHtml(breach.breach_cause) + '</p>'
    : '';

  const categoriesLine = breach.data_categories_affected
    ? '<p><strong>Categories of your personal data affected:</strong> ' +
      escapeHtml(breach.data_categories_affected) +
      '</p>'
    : '';

  const harmLine = breach.potential_harm
    ? '<p><strong>Potential harm:</strong> ' +
      escapeHtml(breach.potential_harm) +
      '</p>'
    : '';

  const remedialText = breach.remedial_actions
    ? escapeHtml(breach.remedial_actions)
    : 'We have taken immediate steps to contain the breach, secure the affected systems, and prevent recurrence. Our investigation is ongoing.';

  const contactLineParts: string[] = [];
  if (clientEmail) contactLineParts.push('Email: ' + escapeHtml(clientEmail));
  if (clientPhone) contactLineParts.push('Telephone: ' + escapeHtml(clientPhone));
  const contactLine = contactLineParts.join(' | ');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Data Breach Notification - ${escapeHtml(clientName)}</title>
<style>
  @page { size: A4; margin: 25mm 20mm; }
  body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.55; }
  .header { text-align: center; border-bottom: 2px solid ${ODPC_BLUE}; padding-bottom: 12px; margin-bottom: 24px; }
  .header h1 { font-size: 13pt; margin: 0 0 4px 0; color: ${ODPC_BLUE}; }
  .header p { font-size: 9pt; margin: 0; color: #555; }
  .client { margin-bottom: 20px; font-size: 10pt; color: #333; }
  .client strong { color: #111; }
  .ref { text-align: right; font-size: 10pt; margin-bottom: 24px; }
  .body { margin-bottom: 20px; text-align: justify; }
  .body p { margin: 0 0 12px 0; }
  .section-title { font-size: 11pt; font-weight: bold; color: ${ODPC_BLUE}; margin: 18px 0 8px 0; }
  .box { border: 1px solid #ccc; padding: 12px; margin: 12px 0; background: #fafafa; }
  .box p { margin: 0 0 6px 0; font-size: 10pt; }
  .box p:last-child { margin-bottom: 0; }
  .steps { margin: 12px 0 12px 20px; padding: 0; }
  .steps li { margin-bottom: 6px; font-size: 11pt; }
  .signature { margin-top: 40px; }
  .signature-line { border-top: 1px solid #111; width: 60%; margin-top: 30px; padding-top: 4px; font-size: 10pt; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 8pt; color: #666; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <h1>${escapeHtml(clientName)}</h1>
  <p>Notification of a Personal Data Breach to Affected Data Subjects</p>
</div>

<div class="client">
  <strong>${escapeHtml(clientName)}</strong><br/>
  ${escapeHtml(clientAddress)}
  ${clientPhone ? '<br/>Tel: ' + escapeHtml(clientPhone) : ''}
  ${clientEmail ? '<br/>Email: ' + escapeHtml(clientEmail) : ''}
</div>

<div class="ref">
  <strong>Date:</strong> ${today}<br/>
  <strong>Reference:</strong> ${referenceNumber}
</div>

<div class="body">
  <p><strong>RE: NOTIFICATION OF A PERSONAL DATA BREACH AFFECTING YOUR PERSONAL DATA</strong></p>

  <p>Dear Sir or Madam,</p>

  <p>We are writing to inform you of a personal data breach that has occurred at <strong>${escapeHtml(clientName)}</strong>. We take our obligations under the Data Protection Act, 2019 seriously, and we believe it is important that you are informed of this incident so that you may take steps to protect yourself.</p>

  <div class="section-title">1. What happened</div>
  <div class="box">
    <p><strong>Date discovered:</strong> ${discoveredAt}</p>
    <p>${escapeHtml(breach.breach_description)}</p>
    ${causeLine}
  </div>

  <div class="section-title">2. What personal data was affected</div>
  <div class="box">
    ${categoriesLine}
    ${harmLine}
    <p>If the specific categories are not listed above, this breach may have affected personal data that you have provided to us in the course of your relationship with our organisation.</p>
  </div>

  <div class="section-title">3. What we have done</div>
  <div class="box">
    <p>${remedialText}</p>
    <p>We have also reported this breach to the Office of the Data Protection Commissioner in accordance with Section 43 of the Data Protection Act, 2019.</p>
  </div>

  <div class="section-title">4. What you can do to protect yourself</div>
  <p>While we have taken steps to contain this breach, we recommend that you take the following precautions:</p>
  <ol class="steps">
    <li>Be alert for any unusual emails, phone calls, or text messages. Do not share passwords, PINs, or one time codes with anyone.</li>
    <li>If you use the same password across multiple accounts, change it now, especially on your email and bank accounts.</li>
    <li>Review your recent bank statements and mobile money transactions for any activity you do not recognise.</li>
    <li>If you receive an unexpected message that references details you believe may have been exposed in this breach, treat it with caution and verify the sender independently.</li>
    <li>If you believe you have been a victim of fraud or identity theft, report it to the relevant authorities immediately.</li>
  </ol>

  <div class="section-title">5. How to contact us</div>
  <div class="box">
    <p>If you have any questions about this notice, or if you believe your personal data has been affected, please contact our Data Protection Officer.</p>
    <p><strong>Organisation:</strong> ${escapeHtml(clientName)}</p>
    ${contactLine ? '<p><strong>Contact:</strong> ' + contactLine + '</p>' : ''}
  </div>

  <div class="section-title">6. Your right to complain</div>
  <p>You have the right to lodge a complaint with the Office of the Data Protection Commissioner if you are dissatisfied with how we have handled this incident. The Office can be reached at <strong>www.odpc.go.ke</strong>.</p>

  <p>We sincerely regret any concern this incident may cause you. We remain committed to protecting your personal data and to learning from this incident to ensure it does not happen again.</p>

  <p>Yours faithfully,</p>
</div>

<div class="signature">
  <p style="margin-bottom: 40px;">&nbsp;</p>
  <div class="signature-line">
    Data Protection Officer<br/>
    ${escapeHtml(clientName)}
  </div>
</div>

<div class="footer">
  This notification was generated by Praxis - ODPC Compliance Infrastructure.<br/>
  Retain this document as part of your statutory records under the Data Protection Act, 2019.
</div>

</body>
</html>`;

  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '-');

  if (asWord) {
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'application/msword',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Content-Disposition':
          'attachment; filename="Breach-DS-Notification-' + safeName + '.doc"',
      },
    });
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Content-Disposition':
        'inline; filename="Breach-DS-Notification-' + safeName + '.html"',
    },
  });
}