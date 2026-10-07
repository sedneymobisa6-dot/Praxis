import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFirmContext } from '@/lib/auth/firmContext';

type RequestBody = {
  notes?: string;
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

  const notes = (body.notes ?? '').trim();

  const { data: dsar } = await supabase
    .from('client_dsar_requests')
    .select('id, client_id, status')
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!dsar) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  if (dsar.status === 'responded' || dsar.status === 'closed') {
    return NextResponse.json({ ok: true, alreadyResponded: true });
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('client_dsar_requests')
    .update({
      status: 'responded',
      response_date: now,
      response_notes: notes || null,
    })
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    firm_id: ctx.firmId,
    client_id: dsar.client_id,
    user_id: ctx.userId,
    action: 'dsar_marked_responded',
    entity_type: 'client_dsar_requests',
    entity_id: params.id,
    metadata: { responded_at: now, has_notes: notes.length > 0 },
  });

  return NextResponse.json({ ok: true });
}