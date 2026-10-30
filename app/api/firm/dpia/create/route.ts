import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFirmContext } from '@/lib/auth/firmContext';

type RiskItem = {
  risk: string;
  impact: string;
  likelihood: string;
  actions: string;
};

type RequestBody = {
  clientId?: string;
  projectName?: string;
  assessmentNeed?: string;
  projectOutline?: string;
  personalDataTypes?: string;
  informationFlow?: string;
  complianceMeasures?: string;
  risks?: RiskItem[];
};

export async function POST(request: Request) {
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

  const clientId = (body.clientId ?? '').trim();
  const projectName = (body.projectName ?? '').trim();
  const assessmentNeed = (body.assessmentNeed ?? '').trim();
  const projectOutline = (body.projectOutline ?? '').trim();
  const personalDataTypes = (body.personalDataTypes ?? '').trim();
  const informationFlow = (body.informationFlow ?? '').trim();
  const complianceMeasures = (body.complianceMeasures ?? '').trim();
  const risks = body.risks ?? [];

  if (!clientId || !projectName) {
    return NextResponse.json(
      { error: 'Client ID and Project Name are required' },
      { status: 400 }
    );
  }

  // Verify the client belongs to this firm
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data: dpia, error: insertError } = await supabase
    .from('client_dpias')
    .insert({
      firm_id: ctx.firmId,
      client_id: clientId,
      project_name: projectName,
      assessment_need: assessmentNeed,
      project_outline: projectOutline,
      personal_data_types: personalDataTypes,
      information_flow: informationFlow,
      compliance_measures: complianceMeasures,
      risk_assessment: risks,
      status: 'draft',
    })
    .select()
    .single();

  if (insertError || !dpia) {
    return NextResponse.json(
      { error: insertError?.message ?? 'Could not save DPIA' },
      { status: 500 }
    );
  }

  await supabase.from('audit_log').insert({
    firm_id: ctx.firmId,
    client_id: clientId,
    user_id: ctx.userId,
    action: 'dpia_created',
    entity_type: 'client_dpias',
    entity_id: dpia.id,
    metadata: { project_name: projectName, risk_count: risks.length },
  });

  return NextResponse.json({ ok: true, dpiaId: dpia.id });
}