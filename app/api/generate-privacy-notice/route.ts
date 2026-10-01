import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ODPC_BLUE = '#0A3D62';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'No profile' }, { status: 400 });
  }

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle();

  if (!school) {
    return NextResponse.json({ error: 'Complete intake form first' }, { status: 400 });
  }

  const { data: activities } = await supabase
    .from('processing_activities')
    .select('*')
    .eq('school_id', school.id);

  const { data: sensitive } = await supabase
    .from('sensitive_data')
    .select('*')
    .eq('school_id', school.id)
    .maybeSingle();

  const { data: transfers } = await supabase
    .from('cross_border_transfers')
    .select('*')
    .eq('school_id', school.id)
    .maybeSingle();

  const { data: measures } = await supabase
    .from('security_measures')
    .select('*')
    .eq('school_id', school.id)
    .order('display_order');

  const schoolName = school.school_name;
  const schoolEmail = school.email || 'the school office';
  const schoolPhone = school.telephone || '';
  const schoolAddress = school.postal_address || '';

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Build processing activities table rows
  const activityRows = (activities ?? [])
    .map((a: any) => {
      return (
        '<tr>' +
        '<td style="border:1px solid #999;padding:8px;">' + a.data_subject_category + '</td>' +
        '<td style="border:1px solid #999;padding:8px;">' + a.personal_data_description + '</td>' +
        '<td style="border:1px solid #999;padding:8px;">' + a.purpose_of_processing + '</td>' +
        '</tr>'
      );
    })
    .join('');

  // Build sensitive data section
  const sensitiveSection = sensitive && sensitive.applicable
    ? '<h2>4. Sensitive Personal Data</h2>' +
      '<p>We process the following categories of sensitive personal data:</p>' +
      '<ul>' +
      (sensitive.data_types || []).map((t: string) => '<li>' + t + '</li>').join('') +
      '</ul>' +
      (sensitive.purpose ? '<p><strong>Purpose:</strong> ' + sensitive.purpose + '</p>' : '')
    : '';

  // Build transfer section
  const transferSection = transfers && transfers.applicable
    ? '<h2>5. International Transfers</h2>' +
      '<p>Some of our service providers store personal data outside Kenya. Personal data may be transferred to the following countries:</p>' +
      '<ul>' +
      (transfers.countries || []).map((c: string) => '<li>' + c + '</li>').join('') +
      '</ul>' +
      '<p>Where we transfer personal data outside Kenya, we ensure that appropriate safeguards are in place in accordance with Section 48 of the Data Protection Act, 2019 and Regulation 40 of the Data Protection (General) Regulations, 2021.</p>'
    : '';

  // Build security measures section
  const measureRows = (measures ?? [])
    .map((m: any) => {
      return (
        '<tr>' +
        '<td style="border:1px solid #999;padding:8px;">' + m.risk_description + '</td>' +
        '<td style="border:1px solid #999;padding:8px;">' + m.safeguard_description + '</td>' +
        '</tr>'
      );
    })
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Privacy Notice - ${schoolName}</title>
<style>
  body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 30px; }
  h1 { font-size: 18pt; color: ${ODPC_BLUE}; margin-bottom: 4px; }
  h2 { font-size: 13pt; color: ${ODPC_BLUE}; margin-top: 28px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
  h3 { font-size: 11pt; margin-top: 16px; margin-bottom: 6px; }
  p { margin: 0 0 12px 0; text-align: justify; }
  ul { margin: 8px 0 12px 20px; padding-left: 0; }
  li { margin-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 10pt; }
  th { background: #f0f0f0; border: 1px solid #999; padding: 8px; text-align: left; }
  .header { text-align: center; border-bottom: 2px solid ${ODPC_BLUE}; padding-bottom: 16px; margin-bottom: 24px; }
  .school-info { font-size: 10pt; color: #555; margin-bottom: 8px; }
  .meta { font-size: 9pt; color: #777; text-align: right; margin-bottom: 20px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 9pt; color: #666; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <h1>${schoolName}</h1>
  <p class="school-info">${schoolAddress}${schoolPhone ? ' | ' + schoolPhone : ''}${schoolEmail ? ' | ' + schoolEmail : ''}</p>
  <p class="meta">Privacy Notice | Last updated: ${today}</p>
</div>

<p><strong>This Privacy Notice explains how ${schoolName} collects, uses, and protects personal data in accordance with the Data Protection Act, 2019 (the "Act") and the Data Protection (General) Regulations, 2021.</strong></p>

<h2>1. Who We Are</h2>
<p>${schoolName} is a data controller registered with the Office of the Data Protection Commissioner. We collect and process personal data for the purpose of providing educational services to our students and managing our relationship with parents, guardians, staff, and other stakeholders.</p>
<p>If you have any questions about this Privacy Notice or how we handle your personal data, please contact us at ${schoolEmail}${schoolPhone ? ' or on ' + schoolPhone : ''}.</p>

<h2>2. Personal Data We Collect and Why</h2>
<p>We collect and process the following categories of personal data:</p>
<table>
  <thead>
    <tr>
      <th>Category of Data Subject</th>
      <th>Personal Data Collected</th>
      <th>Purpose of Processing</th>
    </tr>
  </thead>
  <tbody>
    ${activityRows}
  </tbody>
</table>

<h2>3. Lawful Basis for Processing</h2>
<p>We process personal data on the following lawful bases under Section 30 of the Act:</p>
<ul>
  <li><strong>Consent</strong> - where we have obtained clear and informed consent from the data subject or, in the case of a child, from a parent or legal guardian.</li>
  <li><strong>Performance of a contract</strong> - where processing is necessary to provide educational services or to fulfil our obligations to staff.</li>
  <li><strong>Legal obligation</strong> - where processing is necessary to comply with laws such as the Education Act, the Children Act, and tax and regulatory requirements.</li>
  <li><strong>Public interest</strong> - where processing is necessary to protect the vital interests of a student or to carry out a task in the public interest.</li>
  <li><strong>Legitimate interests</strong> - where processing is necessary for the legitimate interests of the school, provided these are not overridden by the rights of the data subject.</li>
</ul>

${sensitiveSection}

${transferSection}

<h2>${transferSection ? '6' : '5'}. How We Protect Personal Data</h2>
<p>We have implemented the following technical and organizational measures to protect personal data against unauthorized access, loss, or disclosure:</p>
<table>
  <thead>
    <tr>
      <th>Risk</th>
      <th>Safeguard / Security Measure</th>
    </tr>
  </thead>
  <tbody>
    ${measureRows}
  </tbody>
</table>

<h2>${transferSection ? '7' : '6'}. Your Rights as a Data Subject</h2>
<p>Under the Data Protection Act, 2019, you have the following rights:</p>
<ul>
  <li><strong>Right to be informed</strong> - to know how your personal data is being used.</li>
  <li><strong>Right of access</strong> - to obtain a copy of the personal data we hold about you. We will respond within 7 days of your request.</li>
  <li><strong>Right to rectification</strong> - to have inaccurate, incomplete, or misleading data corrected. We will respond within 14 days.</li>
  <li><strong>Right to erasure</strong> - to have your personal data deleted where there is no lawful reason for us to continue processing it. We will respond within 14 days.</li>
  <li><strong>Right to restriction of processing</strong> - to restrict how we process your data in certain circumstances. We will respond within 14 days.</li>
  <li><strong>Right to data portability</strong> - to receive your personal data in a structured, commonly used, machine-readable format, or to have it transferred to another controller. We will respond within 30 days.</li>
  <li><strong>Right to object</strong> - to object to processing based on legitimate interests or for direct marketing purposes.</li>
  <li><strong>Right not to be subject to automated decision-making</strong> - including profiling, where it produces legal or similarly significant effects.</li>
</ul>
<p>To exercise any of these rights, please contact us at ${schoolEmail}. We will respond in accordance with the timelines set out in the Data Protection (General) Regulations, 2021.</p>

<h2>${transferSection ? '8' : '7'}. Children's Data</h2>
<p>Because we provide educational services to children, we take additional care in how we handle children's personal data.</p>
<ul>
  <li>We only process a child's personal data with the consent of a parent or legal guardian, except where the law requires us to process it without consent.</li>
  <li>We verify the identity and authority of any person giving consent on behalf of a child.</li>
  <li>We do not use children's personal data for marketing or profiling purposes.</li>
  <li>We restrict publication of student names, examination results, or photographs to cases where we have obtained explicit parental consent, and we honor any request by a parent to withdraw such consent.</li>
  <li>We implement age verification and child controls where we use online learning platforms or digital tools.</li>
</ul>
<p>These measures are in line with the ODPC's Guidance Note for the Education Sector and Section 33 of the Data Protection Act, 2019.</p>

<h2>${transferSection ? '9' : '8'}. Data Retention</h2>
<p>We retain personal data only for as long as is necessary to fulfil the purpose for which it was collected, or as required by law. Student academic records are retained in accordance with the requirements of the Ministry of Education and other applicable legislation. When data is no longer needed, we securely delete or anonymize it.</p>

<h2>${transferSection ? '10' : '9'}. Sharing of Personal Data</h2>
<p>We may share personal data with:</p>
<ul>
  <li>Government bodies such as the Ministry of Education, the Kenya National Examinations Council, and the Teachers Service Commission, where required by law.</li>
  <li>Service providers who process personal data on our behalf, such as our student information system provider and cloud storage provider. All such providers are bound by written data processing agreements.</li>
  <li>Third parties where we have obtained your consent or where we are legally required to do so.</li>
</ul>
<p>We do not sell personal data. We do not share personal data for commercial purposes without explicit consent.</p>

<h2>${transferSection ? '11' : '10'}. Data Breaches</h2>
<p>In the unlikely event of a personal data breach that poses a real risk of harm to data subjects, we will notify the Office of the Data Protection Commissioner within 72 hours of becoming aware of the breach, and will inform affected data subjects as soon as practicable, in accordance with Section 43 of the Act.</p>

<h2>${transferSection ? '12' : '11'}. Complaints</h2>
<p>If you believe your personal data has been mishandled, you may contact us directly at ${schoolEmail}. If you are not satisfied with our response, you have the right to lodge a complaint with the Office of the Data Protection Commissioner at <strong>www.odpc.go.ke</strong>.</p>

<h2>${transferSection ? '13' : '12'}. Changes to This Notice</h2>
<p>We may update this Privacy Notice from time to time. The most recent version will always be available from the school office or on our website.</p>

<div class="footer">
  This Privacy Notice was generated by Praxis - ODPC Compliance Infrastructure.<br/>
  ${schoolName} | Version ${today}
</div>

</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Content-Disposition': 'inline; filename="Privacy-Notice.html"',
    },
  });
}