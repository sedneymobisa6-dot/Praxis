import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { getFirmContext } from '@/lib/auth/firmContext';
import { DPIAReport } from '@/lib/pdf/DPIAReport';
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

  const { data: dpia } = await supabase
    .from('client_dpias')
    .select('*, clients(name), firms(name)')
    .eq('id', params.id)
    .eq('firm_id', ctx.firmId)
    .maybeSingle();

  if (!dpia) {
    return NextResponse.json(
      { error: 'DPIA not found' },
      { status: 404 }
    );
  }

  const client = (dpia as any).clients;
  const firm = (dpia as any).firms;

  // Supabase sometimes returns JSONB as a string, sometimes as an array.
  // We ensure it's parsed correctly before passing to the PDF.
  let parsedRisks = [];
  if (dpia.risk_assessment) {
    parsedRisks = typeof dpia.risk_assessment === 'string'
      ? JSON.parse(dpia.risk_assessment)
      : dpia.risk_assessment;
  }

  const element = React.createElement(DPIAReport, {
    firmName: firm?.name || 'Praxis Client',
    clientName: client?.name || 'Unknown Client',
    projectName: dpia.project_name,
    assessmentNeed: dpia.assessment_need,
    projectOutline: dpia.project_outline,
    personalDataTypes: dpia.personal_data_types,
    informationFlow: dpia.information_flow,
    complianceMeasures: dpia.compliance_measures,
    riskAssessment: parsedRisks,
    createdAt: dpia.created_at,
  }) as any;

  const pdfBuffer = await renderToBuffer(element);

  const safeName = dpia.project_name.replace(/[^a-zA-Z0-9]/g, '-');
  const filename = 'DPIA-' + safeName + '.pdf';

  return new NextResponse(pdfBuffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="' + filename + '"',
    },
  });
}