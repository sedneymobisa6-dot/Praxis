import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assembleNotice } from '@/lib/privacy/assemble';
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

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data: activities } = await supabase
    .from('client_processing_activities')
    .select('*')
    .eq('client_id', params.id)
    .eq('firm_id', ctx.firmId);

  const { data: sensitive } = await supabase
    .from('client_sensitive_data')
    .select('*')
    .eq('client_id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  const { data: transfers } = await supabase
    .from('client_cross_border_transfers')
    .select('*')
    .eq('client_id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  const { data: measures } = await supabase
    .from('client_security_measures')
    .select('*')
    .eq('client_id', params.id)
    .eq('firm_id', ctx.firmId)
    .order('display_order');

  const clientName = client.name;
  const clientEmail = client.contact_email || 'the organisation office';
  const clientPhone = client.contact_phone || '';
  const clientAddress = client.postal_address || '';

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const notice = assembleNotice(client.sector);

  const activityRows = (activities ?? [])
    .map((a: any) => {
      return (
        '<tr>' +
        '<td style="border:1px solid #999;padding:8px;">' + escapeHtml(a.data_subject_category) + '</td>' +
        '<td style="border:1px solid #999;padding:8px;">' + escapeHtml(a.personal_data_description) + '</td>' +
        '<td style="border:1px solid #999;padding:8px;">' + escapeHtml(a.purpose_of_processing) + '</td>' +
        '</tr>'
      );
    })
    .join('');

  const sensitiveBlock =
    sensitive && sensitive.applicable
      ? '<ul>' +
        (sensitive.data_types || [])
          .map((t: string) => '<li>' + escapeHtml(t) + '</li>')
          .join('') +
        '</ul>' +
        (sensitive.purpose
          ? '<p><strong>Purpose:</strong> ' + escapeHtml(sensitive.purpose) + '</p>'
          : '')
      : '';

  const transfersBlock =
    transfers && transfers.applicable
      ? '<p>Personal data may be transferred to the following countries: <strong>' +
        (transfers.countries || []).map((c: string) => escapeHtml(c)).join(', ') +
        '</strong>.</p>'
      : '';

  const measureRows = (measures ?? [])
    .map((m: any) => {
      return (
        '<tr>' +
        '<td style="border:1px solid #999;padding:8px;">' + escapeHtml(m.risk_description) + '</td>' +
        '<td style="border:1px solid #999;padding:8px;">' + escapeHtml(m.safeguard_description) + '</td>' +
        '</tr>'
      );
    })
    .join('');

  const sectionHtml = notice.sections
    .map((s) => {
      let block = '<h2>' + escapeHtml(s.heading) + '</h2>';

      s.paragraphs.forEach((p) => {
        block += '<p>' + escapeHtml(p) + '</p>';
      });

      if (s.items && s.items.length > 0) {
        block += '<ul>';
        s.items.forEach((item) => {
          block += '<li>' + escapeHtml(item) + '</li>';
        });
        block += '</ul>';
      }

      if (s.heading === 'Personal Data We Collect and Why') {
        block +=
          '<table>' +
          '<thead>' +
          '<tr>' +
          '<th>Category of Data Subject</th>' +
          '<th>Personal Data Collected</th>' +
          '<th>Purpose of Processing</th>' +
          '</tr>' +
          '</thead>' +
          '<tbody>' +
          activityRows +
          '</tbody>' +
          '</table>';
      }

      if (s.heading === 'Sensitive Personal Data' && sensitiveBlock) {
        block += sensitiveBlock;
      }

      if (s.heading === 'International Transfers' && transfersBlock) {
        block += transfersBlock;
      }

      if (s.heading === 'How We Protect Personal Data' && measureRows) {
        block +=
          '<table>' +
          '<thead>' +
          '<tr>' +
          '<th>Risk</th>' +
          '<th>Safeguard / Security Measure</th>' +
          '</tr>' +
          '</thead>' +
          '<tbody>' +
          measureRows +
          '</tbody>' +
          '</table>';
      }

      return block;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Privacy Notice - ${escapeHtml(clientName)}</title>
<style>
  body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 30px; }
  h1 { font-size: 18pt; color: ${ODPC_BLUE}; margin-bottom: 4px; }
  h2 { font-size: 13pt; color: ${ODPC_BLUE}; margin-top: 28px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
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
  <h1>${escapeHtml(clientName)}</h1>
  <p class="school-info">${escapeHtml(clientAddress)}${clientPhone ? ' | ' + escapeHtml(clientPhone) : ''}${clientEmail ? ' | ' + escapeHtml(clientEmail) : ''}</p>
  <p class="meta">Privacy Notice | Last updated: ${today}</p>
</div>

<p><strong>${escapeHtml(notice.intro)}</strong></p>

${sectionHtml}

<div class="footer">
  This Privacy Notice was generated by Praxis - ODPC Compliance Infrastructure.<br/>
  ${escapeHtml(clientName)} | Version ${today}
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
          'attachment; filename="Privacy-Notice-' + safeName + '.doc"',
      },
    });
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Content-Disposition': 'inline; filename="Privacy-Notice.html"',
    },
  });
}