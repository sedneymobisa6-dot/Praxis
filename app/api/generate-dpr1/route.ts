import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { DPR1Document } from '@/lib/pdf/DPR1Document';
import React from 'react';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'No profile' }, { status: 400 });
  }

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle();

  if (!school) {
    return NextResponse.json({ error: 'No school data. Complete intake form first.' }, { status: 400 });
  }

  const { data: activities } = await supabase
    .from('processing_activities')
    .select('*')
    .eq('school_id', school.id);

  const { data: sensitive } = await supabase
    .from('sensitive_data')
    .select('*')
    .eq('school_id', school.id)
    .maybeSingle();

  const { data: transfers } = await supabase
    .from('cross_border_transfers')
    .select('*')
    .eq('school_id', school.id)
    .maybeSingle();

  const { data: measures } = await supabase
    .from('security_measures')
    .select('*')
    .eq('school_id', school.id)
    .order('display_order');

  const pdfBuffer = await renderToBuffer(
    React.createElement(DPR1Document, {
      school,
      activities: activities ?? [],
      sensitive: sensitive ?? null,
      transfers: transfers ?? null,
      measures: measures ?? [],
    })
  );

  const filename = `DPR1-${school.school_name.replace(/\s+/g, '-')}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}