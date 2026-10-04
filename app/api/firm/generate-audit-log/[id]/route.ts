import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { SECTOR_LABELS } from '@/lib/sectors';
import { AuditLogDocument } from '@/lib/pdf/AuditLogDocument';
import React from 'react';

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
    .select('action, created_at')
    .eq('client_id', params.id)
    .order('created_at', { ascending: true });

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const reference = 'AUDIT/' + params.id.substring(0, 8).toUpperCase();
  const sectorLabel = SECTOR_LABELS[client.sector] ?? client.sector;
  const clientContact = client.contact_email || client.contact_phone || '';

  const element = React.createElement(AuditLogDocument, {
    firmName: firmName,
    firmEmail: firmEmail,
    firmPhone: firmPhone,
    clientName: client.name,
    clientSector: sectorLabel,
    clientCounty: client.county || '',
    clientContact: clientContact,
    reference: reference,
    today: today,
    entries: entries ?? [],
  }) as any;

  const pdfBuffer = await renderToBuffer(element);

  const safeName = client.name.replace(/[^a-zA-Z0-9]/g, '-');
  const filename = 'Audit-Log-' + safeName + '.pdf';

  return new NextResponse(pdfBuffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="' + filename + '"',
    },
  });
}