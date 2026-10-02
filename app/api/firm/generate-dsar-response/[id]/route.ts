import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ODPC_BLUE = '#0A3D62';

const typeLabels: Record<string, string> = {
  access: 'Right of Access',
  rectification: 'Right to Rectification',
  erasure: 'Right to Erasure',
  portability: 'Right to Portability',
  restriction: 'Right to Restriction',
  objection: 'Right to Object',
};

const legalBasis: Record<string, string> = {
  access: 'Section 26(b) and Section 40(1)(a) of the Data Protection Act 2019, read together with Regulation 9 of the Data Protection (General) Regulations, 2021',
  rectification: 'Section 26(d) and Section 40(1)(a) of the Data Protection Act 2019, read together with Regulation 10 of the Data Protection (General) Regulations, 2021',
  erasure: 'Section 26(e) and Section 40(1)(b) of the Data Protection Act 2019, read together with Regulation 12 of the Data Protection (General) Regulations, 2021',
  portability: 'Section 38 of the Data Protection Act 2019, read together with Regulation 11 of the Data Protection (General) Regulations, 2021',
  restriction: 'Section 34 of the Data Protection Act 2019, read together with Regulation 7 of the Data Protection (General) Regulations, 2021',
  objection: 'Section 36 of the Data Protection Act 2019, read together with Regulation 8 of the Data Protection (General) Regulations, 2021',
};

const actionText: Record<string, string> = {
  access: 'provide you with access to the personal data we hold about you, together with the information required under Section 26(b) of the Act',
  rectification: 'rectify the personal data we hold about you in accordance with your request',
  erasure: 'erase the personal data that is no longer necessary for the purpose for which it was collected',
  portability: 'transmit your personal data to the recipient you have nominated in a structured, commonly used and machine-readable format',
  restriction: 'restrict the processing of your personal data pending resolution of the grounds on which your request is based',
  objection: 'cease processing your personal data for the purpose you have objected to',
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data: dsar } = await supabase
    .from('client_dsar_requests')
    .select('*, clients(name, postal_address, contact_phone, contact_email)')
    .eq('id', params.id)
    .maybeSingle();

  if (!dsar) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const client = (dsar as any).clients;
  const clientName = client?.name ?? 'Your Organisation';
  const clientAddress = client?.postal_address ?? '';
  const clientPhone = client?.contact_phone ?? '';
  const clientEmail = client?.contact_email ?? '';

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const requestTypeLabel = typeLabels[dsar.request_type] ?? dsar.request_type;
  const basis = legalBasis[dsar.request_type] ?? '';
  const action = actionText[dsar.request_type] ?? '';

  const requestDate = new Date(dsar.date_received).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const deadlineDate = new Date(dsar.deadline_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const phoneLine = clientPhone ? 'Tel: ' + clientPhone : '';
  const emailLine = clientEmail ? 'Email: ' + clientEmail : '';
  const contactLine = [phoneLine, emailLine].filter(Boolean).join(' | ');

  const referenceNumber = 'DSAR/' + params.id.substring(0, 8).toUpperCase();

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
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
  <h1>${clientName}</h1>
  <p>Data Protection Act, 2019 - Response to Data Subject Request</p>
</div>

<div class="client">
  <strong>${clientName}</strong><br/>
  ${clientAddress}${contactLine ? '<br/>' + contactLine : ''}
</div>

<div class="ref">
  <strong>Date:</strong> ${today}<br/>
  <strong>Reference:</strong> ${referenceNumber}<br/>
  <strong>Request Type:</strong> ${requestTypeLabel}
</div>

<div class="body">
  <p>Dear ${dsar.requester_name},</p>

  <p><strong>RE: RESPONSE TO YOUR REQUEST UNDER THE DATA PROTECTION ACT, 2019</strong></p>

  <p>We refer to your request received on ${requestDate}, submitted in exercise of your rights under the Data Protection Act, 2019 (the Act).</p>

  <p>Your request has been reviewed and recorded in accordance with the requirements of the Act, specifically ${basis}.</p>

  <div class="section-title">Request Summary</div>
  <div class="box">
    <p><strong>Requester:</strong> ${dsar.requester_name} (${dsar.requester_type})</p>
    <p><strong>Request Type:</strong> ${requestTypeLabel}</p>
    <p><strong>Description:</strong> ${dsar.request_description}</p>
    <p><strong>Date Received:</strong> ${requestDate}</p>
    <p><strong>Legal Deadline:</strong> ${deadlineDate}</p>
  </div>

  <div class="section-title">Our Response</div>
  <p>In accordance with the Act, we will ${action}.</p>

  <p>If we are unable to fully comply with your request, we will provide you with written reasons in accordance with the Act. You retain the right to lodge a complaint with the Office of the Data Protection Commissioner if you are dissatisfied with our response.</p>

  <p>If you require any clarification, please contact us using the details above.</p>

  <p>Yours faithfully,</p>
</div>

<div class="signature">
  <p style="margin-bottom: 40px;">&nbsp;</p>
  <div class="signature-line">
    Data Protection Officer<br/>
    ${clientName}
  </div>
</div>

<div class="footer">
  This letter was generated by Praxis - ODPC Compliance Infrastructure.<br/>
  Retain this document as part of your statutory records under the Data Protection Act, 2019.
</div>

</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Content-Disposition':
        'inline; filename="DSAR-Response-' + params.id.substring(0, 8) + '.html"',
    },
  });
}