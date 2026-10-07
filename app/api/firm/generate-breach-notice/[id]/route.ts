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

  const deadline = new Date(
    new Date(breach.discovered_at).getTime() + 72 * 60 * 60 * 1000
  ).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const referenceNumber = 'BREACH/' + params.id.substring(0, 8).toUpperCase();

  const causeLine = breach.breach_cause
    ? '<p><strong>Cause:</strong> ' + escapeHtml(breach.breach_cause) + '</p>'
    : '';

  const subjectsLine =
    breach.data_subjects_affected !== null
      ? '<p><strong>Number of data subjects affected:</strong> ' +
        breach.data_subjects_affected +
        '</p>'
      : '';

  const categoriesLine = breach.data_categories_affected
    ? '<p><strong>Categories of personal data affected:</strong> ' +
      escapeHtml(breach.data_categories_affected) +
      '</p>'
    : '';

  const harmLine = breach.potential_harm
    ? '<p><strong>Potential harm to affected data subjects:</strong> ' +
      escapeHtml(breach.potential_harm) +
      '</p>'
    : '';

  const remedialText = breach.remedial_actions
    ? escapeHtml(breach.remedial_actions)
    : 'The organisation has taken immediate steps to contain the breach, secure affected systems, and prevent recurrence. Further remediation is ongoing.';

  const subjectsNotifiedText = breach.data_subjects_notified
    ? 'Affected data subjects have been notified in writing of the breach and of the steps they may take to mitigate any harm, in accordance with Section 43(1)(b) of the Act.'
    : 'We confirm that we are in the process of notifying affected data subjects in writing, in accordance with Section 43(1)(b) of the Act, unless the data subjects cannot be individually identified or unless the breach does not present a real risk of harm.';

  const emailLine = clientEmail
    ? '<p><strong>Email:</strong> ' + escapeHtml(clientEmail) + '</p>'
    : '';
  const phoneLine = clientPhone
    ? '<p><strong>Telephone:</strong> ' + escapeHtml(clientPhone) + '</p>'
    : '';
  const reportedBy = breach.reported_by
    ? escapeHtml(breach.reported_by)
    : 'Data Protection Officer, ' + escapeHtml(clientName);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Breach Notification - ${escapeHtml(clientName)}</title>
<style>
  @page { size: A4; margin: 25mm 20mm; }
  body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.5; }
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
  .signature { margin-top: 40px; }
  .signature-line { border-top: 1px solid #111; width: 60%; margin-top: 30px; padding-top: 4px; font-size: 10pt; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 8pt; color: #666; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <h1>${escapeHtml(clientName)}</h1>
  <p>Data Protection Act, 2019 - Notification of Personal Data Breach</p>
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

<p><strong>To:</strong><br/>
The Data Commissioner<br/>
Office of the Data Protection Commissioner<br/>
Britam Towers, 12th Floor, Hospital Road<br/>
Upperhill, Nairobi<br/>
Kenya</p>

<div class="body">
  <p><strong>RE: NOTIFICATION OF PERSONAL DATA BREACH UNDER SECTION 43 OF THE DATA PROTECTION ACT, 2019</strong></p>

  <p>Pursuant to Section 43 of the Data Protection Act, 2019 and Regulation 38 of the Data Protection (General) Regulations, 2021, we hereby notify the Office of the Data Protection Commissioner of a personal data breach that has occurred at <strong>${escapeHtml(clientName)}</strong>.</p>

  <div class="section-title">1. Date and Circumstances of Discovery</div>
  <div class="box">
    <p><strong>Date and time of discovery:</strong> ${discoveredAt}</p>
    <p><strong>Notified by:</strong> ${reportedBy}</p>
    <p>This notification is submitted within the 72-hour window required under Section 43(1)(a) of the Act. The deadline for this notification was <strong>${deadline}</strong>.</p>
  </div>

  <div class="section-title">2. Description of the Breach</div>
  <div class="box">
    <p>${escapeHtml(breach.breach_description)}</p>
    ${causeLine}
  </div>

  <div class="section-title">3. Personal Data and Data Subjects Affected</div>
  <div class="box">
    ${subjectsLine}
    ${categoriesLine}
    ${harmLine}
  </div>

  <div class="section-title">4. Action Taken to Address the Breach</div>
  <div class="box">
    <p>${remedialText}</p>
  </div>

  <div class="section-title">5. Notification of Affected Data Subjects</div>
  <p>${subjectsNotifiedText}</p>

  <div class="section-title">6. Contact Information</div>
  <div class="box">
    <p><strong>Data Controller:</strong> ${escapeHtml(clientName)}</p>
    <p><strong>Contact person:</strong> Data Protection Officer</p>
    ${emailLine}
    ${phoneLine}
  </div>

  <p>We remain committed to full compliance with the Data Protection Act, 2019 and to cooperating fully with the Office of the Data Protection Commissioner in the investigation and resolution of this matter.</p>

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
          'attachment; filename="Breach-Notification-' + safeName + '.doc"',
      },
    });
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Content-Disposition':
        'inline; filename="Breach-Notification-' + safeName + '.html"',
    },
  });
}