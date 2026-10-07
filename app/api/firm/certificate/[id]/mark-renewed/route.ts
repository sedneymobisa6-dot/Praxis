import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFirmContext } from '@/lib/auth/firmContext';

type RequestBody = {
  newCertificateNumber?: string;
  newIssuedAt?: string;
  newExpiresAt?: string;
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getFirmContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const supabase = createClient();

  let body: RequestBody = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { data: oldCert } = await supabase
    .from('client_certificates')
    .select('id, client_id, certificate_number, issued_at, expires_at, superseded_at')
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!oldCert) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  if (oldCert.superseded_at) {
    return NextResponse.json(
      { error: 'This certificate has already been renewed' },
      { status: 400 }
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const newIssuedAt = body.newIssuedAt ?? nowIso;
  const newExpiresAt =
    body.newExpiresAt ??
    new Date(now.getTime() + 24 * 30 * 24 * 60 * 60 * 1000).toISOString();

  const newCertificateNumber =
    body.newCertificateNumber?.trim() || oldCert.certificate_number || null;

  const { data: newCert, error: insertError } = await supabase
    .from('client_certificates')
    .insert({
      firm_id: ctx.firmId,
      client_id: oldCert.client_id,
      certificate_number: newCertificateNumber,
      issued_at: newIssuedAt,
      expires_at: newExpiresAt,
      certificate_type: 'renewal',
      form_filed: 'DPR2',
    })
    .select()
    .single();

  if (insertError || !newCert) {
    return NextResponse.json(
      { error: insertError?.message ?? 'Could not create renewal certificate' },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from('client_certificates')
    .update({
      superseded_at: nowIso,
      superseded_by: newCert.id,
    })
    .eq('id', oldCert.id)
    .eq('firm_id', ctx.firmId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    firm_id: ctx.firmId,
    client_id: oldCert.client_id,
    user_id: ctx.userId,
    action: 'certificate_renewed_dpr2',
    entity_type: 'client_certificates',
    entity_id: newCert.id,
    metadata: {
      old_certificate_id: oldCert.id,
      new_certificate_id: newCert.id,
      new_expires_at: newExpiresAt,
    },
  });

  return NextResponse.json({
    ok: true,
    newCertificateId: newCert.id,
  });
}