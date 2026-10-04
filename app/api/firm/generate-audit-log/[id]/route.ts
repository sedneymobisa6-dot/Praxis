import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ODPC_BLUE = '#0A3D62';

const actionLabels: Record<string, string> = {
  client_created: 'Client registered on Praxis',
  intake_submitted: 'Compliance intake form completed',
  intake_updated: 'Compliance intake form updated',
  certificate_recorded: 'ODPC certificate recorded',
  dsar_logged: 'Data subject request logged',
  breach_reported: 'Data breach reported',
};

function humanize(action: string) {
  if (actionLabels[action]) return actionLabels[action];
  return action.replace(/_/g, ' ');
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data: client } = await supabase
    .from('clients')
    .select('*, firms(name, contact_email, contact_phone)')
    .eq('id', params.id)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const firm = (client as any).firms;
  const firmName = firm?.name ?? 'Law Firm';
  const firmEmail = firm?.contact_email ?? '';
  const firmPhone = firm?.contact_phone ?? '';

  const { data: entries } = await supabase
    .from('audit_log')
    .select('action, created_at, entity_type')
    .eq('client_id', params.id)
    .order('created_at', { ascending: true });

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const reference = 'AUDIT/' + params.id.substring(0, 8).toUpperCase();

  const rows = (entries ?? [])
    .map((e, i) => {
      const when = new Date(e.created_at).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return (
        '<tr>' +
        '<td style="border:1px solid #999;padding:8px;text-align:center;">' + (i + 1) + '</td>' +
        '<td style="border:1px solid #999;padding:8px;">' + when + '</td>' +
        '<td style="border:1px solid #999;padding:8px;">' + humanize(e.action) + '</td>' +
        '</tr>'
      );
    })
    .join('');

  const totalEntries = entries?.length ?? 0;

  const contactBits = [firmEmail, firmPhone].filter(Boolean).join(' | ');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Audit Log - ${client.name}</title>
<style>
  @page { size: A4; margin: 25mm 20mm; }
  body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.5; }
  .header { text-align: center; border-bottom: 2px solid ${ODPC_BLUE}; padding-bottom: 12px; margin-bottom: 24px; }
  .header h1 { font-size: 13pt; margin: 0 0 4px 0; color: ${ODPC_BLUE}; }
  .header p { font-size: 9pt; margin: 0; color: #555; }
  .meta { font-size: 10pt; color: #333; margin-bottom: 20px; }
  .meta strong { color: #111; }
  .ref { text-align: right; font-size: 10pt; margin-bottom: 24px; }
  h2 { font-size: 12pt; color: ${ODPC_BLUE}; margin: 20px 0 10px 0; }
  table { border-collapse: collapse; width: 100%; font-size: 10pt; margin-top: 10px; }
  th { background: #f0f0f0; border: 1px solid #999; padding: 8px; text-align: left; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 8pt; color: #666; text-align: center; }
  .summary { border: 1px solid #ccc; padding: 12px; background: #fafafa; margin: 12px 0; font-size: 10pt; }
</style>
</head>
<body>

<div class="header">
  <h1>${firmName}</h1>
  <p>Data Protection Compliance - Audit Trail</p>
</div>

<div class="meta">
  <strong>Client:</strong> ${client.name}<br/>
  <strong>Sector:</strong> ${client.sector}<br/>
  ${client.county ? '<strong>County:</strong> ' + client.county + '<br/>' : ''}
  ${contactBits ? '<strong>Contact:</strong> ' + contactBits : ''}
</div>

<div class="ref">
  <strong>Date:</strong> ${today}<br/>
  <strong>Reference:</strong> ${reference}
</div>

<h2>Summary</h2>
<div class="summary">
  <p style="margin:0;">This document records every compliance action taken by ${firmName} on behalf of ${client.name} under the Data Protection Act, 2019. It is maintained as part of the firm's statutory record-keeping obligations.</p>
  <p style="margin:8px 0 0 0;"><strong>Total actions recorded:</strong> ${totalEntries}</p>
</div>

<h2>Action Log</h2>
<table>
  <thead>
    <tr>
      <th style="width:8%;text-align:center;">No.</th>
      <th style="width:32%;">Date and Time</th>
      <th style="width:60%;">Action</th>
    </tr>
  </thead>
  <tbody>
    ${rows || '<tr><td colspan="3" style="border:1px solid #999;padding:12px;text-align:center;color:#777;">No actions recorded yet.</td></tr>'}
  </tbody>
</table>

<h2>Certification</h2>
<p>This audit trail was generated automatically from the Praxis compliance platform and reflects every action recorded against this client. It is provided for the purpose of demonstrating compliance under the Data Protection Act, 2019 and the Data Protection (General) Regulations, 2021.</p>

<div style="margin-top:40px;">
  <div style="border-top:1px solid #111;width:60%;margin-top:30px;padding-top:4px;font-size:10pt;">
    Data Protection Officer<br/>
    ${firmName}
  </div>
</div>

<div class="footer">
  Generated by Praxis - ODPC Compliance Infrastructure.<br/>
  ${firmName} | ${client.name} | ${today}
</div>

</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Content-Disposition':
        'inline; filename="Audit-Log-' + params.id.substring(0, 8) + '.html"',
    },
  });
}