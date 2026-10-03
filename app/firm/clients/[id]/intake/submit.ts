import type { Activity, Measure } from './form';

type SupabaseClient = any;

type SubmitArgs = {
  supabase: SupabaseClient;
  clientId: string;
  isEdit: boolean;
  postalAddress: string;
  telephone: string;
  email: string;
  county: string;
  legalEstablishment: string;
  activities: Activity[];
  sensitiveApplicable: boolean;
  sensitiveTypes: string[];
  sensitivePurpose: string;
  transferApplicable: boolean;
  transferCountries: string;
  measures: Measure[];
  employeeCount: string;
  turnover: string;
};

export async function submitIntake(args: SubmitArgs): Promise<{ error?: string }> {
  const supabase = args.supabase;
  const clientId = args.clientId;

  const userRes = await supabase.auth.getUser();
  const user = userRes.data.user;
  if (!user) {
    return { error: 'Not signed in.' };
  }

  const firmRes = await supabase
    .from('firm_users')
    .select('firm_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const firmUser = firmRes.data;
  if (!firmUser) {
    return { error: 'Could not find your firm.' };
  }

  const firmId = firmUser.firm_id;

  await supabase
    .from('clients')
    .update({
      postal_address: args.postalAddress,
      contact_phone: args.telephone,
      contact_email: args.email,
      county: args.county,
      legal_establishment: args.legalEstablishment,
      employee_count: args.employeeCount,
      turnover_range: args.turnover,
    })
    .eq('id', clientId);

  await supabase.from('client_processing_activities').delete().eq('client_id', clientId);
  await supabase.from('client_sensitive_data').delete().eq('client_id', clientId);
  await supabase.from('client_cross_border_transfers').delete().eq('client_id', clientId);
  await supabase.from('client_security_measures').delete().eq('client_id', clientId);

  const validActivities = args.activities.filter((a) => {
    return (
      a.data_subject_category &&
      a.personal_data_description &&
      a.purpose_of_processing
    );
  });

  const activityRows = validActivities.map((a) => ({
    firm_id: firmId,
    client_id: clientId,
    data_subject_category: a.data_subject_category,
    personal_data_description: a.personal_data_description,
    purpose_of_processing: a.purpose_of_processing,
  }));

  if (activityRows.length > 0) {
    await supabase.from('client_processing_activities').insert(activityRows);
  }

  await supabase.from('client_sensitive_data').insert({
    firm_id: firmId,
    client_id: clientId,
    applicable: args.sensitiveApplicable,
    data_types: args.sensitiveTypes,
    purpose: args.sensitivePurpose,
  });

  const countriesArray = args.transferCountries
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  await supabase.from('client_cross_border_transfers').insert({
    firm_id: firmId,
    client_id: clientId,
    applicable: args.transferApplicable,
    countries: countriesArray,
  });

  const validMeasures = args.measures.filter((m) => {
    return m.risk_description && m.safeguard_description;
  });

  const measureRows = validMeasures.map((m, i) => ({
    firm_id: firmId,
    client_id: clientId,
    risk_description: m.risk_description,
    safeguard_description: m.safeguard_description,
    display_order: i + 1,
  }));

  if (measureRows.length > 0) {
    await supabase.from('client_security_measures').insert(measureRows);
  }

  const actionName = args.isEdit ? 'intake_updated' : 'intake_submitted';

  await supabase.from('audit_log').insert({
    firm_id: firmId,
    client_id: clientId,
    user_id: user.id,
    action: actionName,
    entity_type: 'clients',
    entity_id: clientId,
  });

  return {};
}