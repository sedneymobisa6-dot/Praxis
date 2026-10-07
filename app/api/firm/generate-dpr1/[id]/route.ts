import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { getFirmContext } from '@/lib/auth/firmContext';
import React from 'react';
import { DPR1Document } from '@/lib/pdf/DPR1Document';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getFirmContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const supabase = createClient();

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

  const school = {
    school_name: client.name,
    postal_address: client.postal_address,
    telephone: client.contact_phone,
    email: client.contact_email,
    county: client.county,
    country: 'Kenya',
    sector: client.sector,
    legal_establishment: client.legal_establishment,
    employee_count: client.employee_count,
    turnover_range: client.turnover_range,
  };

  const element = React.createElement(DPR1Document, {
    school,
    activities: activities ?? [],
    sensitive: sensitive ?? null,
    transfers: transfers ?? null,
    measures: measures ?? [],
  }) as any;

  const pdfBuffer = await renderToBuffer(element);

  const filename = 'DPR1-' + client.name.replace(/\s+/g, '-') + '.pdf';

  return new NextResponse(pdfBuffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="' + filename + '"',
    },
  });
}