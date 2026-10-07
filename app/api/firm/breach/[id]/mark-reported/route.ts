import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFirmContext } from '@/lib/auth/firmContext';

type RequestBody = {
  mark?: 'odpc_notified' | 'data_subjects_notified';
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

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const mark = body.mark;
  if (mark !== 'odpc_notified' && mark !== 'data_subjects_notified') {
    return NextResponse.json(
      { error: 'mark must be odpc_notified or data_subjects_notified' },
      { status: 400 }
    );
  }

  const { data: breach } = await supabase
    .from('client_breaches')
    .select('id, odpc_notified, data_subjects_notified')
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!breach) {
    return NextResponse.json({ error: 'Breach not found' }, { status: 404 });
  }

  const now = new Date().toISOString();

  const update: Record<string, any> = {};

  if (mark === 'odpc_notified') {
    if (breach.odpc_notified) {
      return NextResponse.json({ ok: true, alreadyMarked: true });
    }
    update.odpc_notified = true;
    update.odpc_notified_at = now;
  }

  if (mark === 'data_subjects_notified') {
    if (breach.data_subjects_notified) {
      return NextResponse.json({ ok: true, alreadyMarked: true });
    }
    update.data_subjects_notified = true;
    update.data_subjects_notified_at = now;
  }

  const { error: updateError } = await supabase
    .from('client_breaches')
    .update(update)
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    firm_id: ctx.firmId,
    client_id: null,
    user_id: ctx.userId,
    action:
      mark === 'odpc_notified'
        ? 'breach_marked_reported_odpc'
        : 'breach_marked_subjects_notified',
    entity_type: 'client_breaches',
    entity_id: params.id,
    metadata: { marked_at: now },
  });

  return NextResponse.json({ ok: true });
}