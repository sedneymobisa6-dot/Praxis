import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ODPC_BLUE = '#0A3D62';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data: breach } = await supabase
    .from('breaches')
    .select('*, schools(school_name, postal_address, telephone, email)')
    .eq('id', params.id)
    .maybeSingle();

  if (!breach) {
    return NextResponse.json({ error: 'Breach not found' }, { status: 404 });
  }

  const school = (breach as any).schools;
  const schoolName = school?.school_name ?? 'Your School';
  const schoolAddress = school?.postal_address ?? '';
  const schoolPhone = school?.telephone ?? '';
  const schoolEmail = school?.email ?? '';

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

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 25mm 20mm; }
  body { font-family: 'Helvetica', Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.5; }
  .header { text-align: center; border-bottom: 2px solid ${ODPC_BLUE}; padding-bottom: 12px; margin-bottom: 24px; }
  .header h1 { font-size: 13pt; margin: 0 0 4px 0; color: ${ODPC_BLUE}; }
  .header p { font-size: 9pt; margin: 0; color: #555; }
  .school { margin-bottom: 20px; font-size: 10pt; color: #333; }
  .school strong { color: #111; }
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
  .urgent { color: #DC2626; font-weight: bold; }
</style>
</head>
<body>

<div class="header">
  <h1>${schoolName}</h1>
  <p>Data Protection Act, 2019 — Notification of Personal Data Breach</p>
</div>

<div class="school">
  <strong>${schoolName}</strong><br/>
  ${schoolAddress}<br/>
  ${schoolPhone ? 'Tel: ' + schoolPhone : ''} ${schoolEmail ? '| Email: ' + schoolEmail : ''}
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

  <p>Pursuant to Section 43 of the Data Protection Act, 2019 and Regulation 38 of the Data Protection (General) Regulations, 2021, we hereby notify the Office of the Data Protection Commissioner of a personal data breach that has occurred at <strong>${schoolName}</strong>.</p>

  <div class="section-title">1. Date and Circumstances of Discovery</div>
  <div class="box">
    <p><strong>Date and time of discovery:</strong> ${discoveredAt}</p>
    <p><strong>Notified by:</strong> ${breach.reported_by || 'Data Protection Officer, ' + schoolName}</p>
    <p>This notification is submitted within the 72-hour window required under Section 43(1)(a) of the Act. The deadline for this notification was <strong>${deadline}</strong>.</p>
  </div>

  <div class="section-title">2. Description of the Breach</div>
  <div class="box">
    <p>${breach.breach_description}</p>
    ${breach.breach_cause ? '<p><strong>Cause:</strong> ' + breach.breach_cause + '</p>' : ''}
  </div>

  <div class="section-title">3. Personal Data and Data Subjects Affected</div>
  <div class="box">
    ${breach.data_subjects_affected !== null ? '<p><strong>Number of data subjects affected:</strong> ' + breach.data_subjects_affected + '</p>' : ''}
    ${breach.data_categories_affected ? '<p><strong>Categories of personal data affected:</strong> ' + breach.data_categories_affected + '</p>' : ''}
    ${breach.potential_harm ? '<p><strong>Potential harm to affected data subjects:</strong> ' + breach.potential_harm + '</p>' : ''}
  </div>

  <div class="section-title">4. Action Taken to Address the Breach</div>
  <div class="box">
    <p>${breach.remedial_actions || 'The institution has taken immediate steps to contain the breach, secure affected systems, and prevent recurrence. Further remediation is ongoing.'}</p>
  </div>

  <div class="section-title">5. Notification of Affected Data Subjects</div>
  <p>${
    breach.data_subjects_notified
      ? 'Affected data subjects have been notified in writing of the breach and of the steps they may take to mitigate any harm, in accordance with Section 43(1)(b) of the Act.'
      : 'We confirm that we are in the process of notifying affected data subjects in writing, in accordance with Section 43(1)(b) of the Act, unless the data subjects cannot be individually identified or unless the breach does not present a real risk of harm.'
  }</p>

  <div class="section-title">6. Contact Information</div>
  <div class="box">
    <p><strong>Data Controller:</strong> ${schoolName}</p>
    <p><strong>Contact person:</strong> Data Protection Officer</p>
    ${schoolEmail ? '<p><strong>Email:</strong> ' + schoolEmail + '</p>' : ''}
    ${schoolPhone ? '<p><strong>Telephone:</strong> ' + schoolPhone + '</p>' : ''}
  </div>

  <p>We remain committed to full compliance with the Data Protection Act, 2019 and to cooperating fully with the Office of the Data Protection Commissioner in the investigation and resolution of this matter.</p>

  <p>Yours faithfully,</p>
</div>

<div class="signature">
  <p style="margin-bottom: 40px;">&nbsp;</p>
  <div class="signature-line">
    Data Protection Officer<br/>
    ${schoolName}
  </div>
</div>

<div class="footer">
  This notification was generated by Praxis — ODPC Compliance Infrastructure.<br/>
  Retain this document as part of your statutory records under the Data Protection Act, 2019.
</div>

</body>
</html>
  `.trim();

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Content-Disposition':
        'inline; filename="Breach-Notification-' +
        params.id.substring(0, 8) +
        '.html"',
    },
  });
}