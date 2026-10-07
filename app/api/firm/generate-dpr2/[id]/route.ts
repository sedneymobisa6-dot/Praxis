import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { getFirmContext } from '@/lib/auth/firmContext';
import { DPR2Document } from '@/lib/pdf/DPR2Document';
import React from 'react';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getFirmContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const supabase = createClient();

  const { data: certificate } = await supabase
    .from('client_certificates')
    .select('*, clients(*)')
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!certificate) {
    return NextResponse.json(
      { error: 'Certificate not found' },
      { status: 404 }
    );
  }

  const client = (certificate as any).clients;

  if (!client) {
    return NextResponse.json(
      { error: 'Client not found for this certificate' },
      { status: 404 }
    );
  }

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

  const previous = {
    certificate_number: certificate.certificate_number,
    issued_at: certificate.issued_at,
    expires_at: certificate.expires_at,
  };

  const element = React.createElement(DPR2Document, {
    school,
    previous,
  }) as any;

  const pdfBuffer = await renderToBuffer(element);

  const safeName = client.name.replace(/[^a-zA-Z0-9]/g, '-');
  const filename = 'DPR2-' + safeName + '.pdf';

  return new NextResponse(pdfBuffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="' + filename + '"',
    },
  });
}