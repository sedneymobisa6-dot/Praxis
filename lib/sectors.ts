export type SectorCode =
  | 'education'
  | 'healthcare'
  | 'financial_services'
  | 'sacco'
  | 'insurance'
  | 'debt_collection'
  | 'public_bodies'
  | 'hospitality'
  | 'property'
  | 'security_cctv'
  | 'faith'
  | 'direct_marketing'
  | 'transport'
  | 'telecom'
  | 'gaming'
  | 'genetic_data'
  | 'other';

export type SectorConfig = {
  code: SectorCode;
  label: string;
  entityLabel: string;
  templateFamily: 'education' | 'healthcare' | 'finance' | 'public' | 'base';
  extraClause: string | null;
};

export const SECTORS: Record<SectorCode, SectorConfig> = {
  education: {
    code: 'education',
    label: 'Education (school, college, university)',
    entityLabel: 'School',
    templateFamily: 'education',
    extraClause: null,
  },
  healthcare: {
    code: 'healthcare',
    label: 'Healthcare (hospital, clinic, lab, pharmacy)',
    entityLabel: 'Facility',
    templateFamily: 'healthcare',
    extraClause: null,
  },
  financial_services: {
    code: 'financial_services',
    label: 'Financial Services (bank, lender, payment provider)',
    entityLabel: 'Institution',
    templateFamily: 'finance',
    extraClause: null,
  },
  sacco: {
    code: 'sacco',
    label: 'SACCO (savings and credit cooperative)',
    entityLabel: 'SACCO',
    templateFamily: 'finance',
    extraClause: 'sacco',
  },
  insurance: {
    code: 'insurance',
    label: 'Insurance (insurer, broker, agent)',
    entityLabel: 'Insurer',
    templateFamily: 'finance',
    extraClause: 'insurance',
  },
  debt_collection: {
    code: 'debt_collection',
    label: 'Debt Collection and Credit Reference',
    entityLabel: 'Institution',
    templateFamily: 'finance',
    extraClause: 'debt',
  },
  public_bodies: {
    code: 'public_bodies',
    label: 'Public Bodies (county, national, state corporation)',
    entityLabel: 'Public Body',
    templateFamily: 'public',
    extraClause: null,
  },
  hospitality: {
    code: 'hospitality',
    label: 'Hospitality (hotel, restaurant, lounge)',
    entityLabel: 'Establishment',
    templateFamily: 'base',
    extraClause: 'hospitality',
  },
  property: {
    code: 'property',
    label: 'Property Management and Real Estate',
    entityLabel: 'Agency',
    templateFamily: 'base',
    extraClause: 'property',
  },
  security_cctv: {
    code: 'security_cctv',
    label: 'Security Services and CCTV Operations',
    entityLabel: 'Provider',
    templateFamily: 'base',
    extraClause: 'cctv',
  },
  faith: {
    code: 'faith',
    label: 'Faith Organisations',
    entityLabel: 'Organisation',
    templateFamily: 'base',
    extraClause: 'faith',
  },
  direct_marketing: {
    code: 'direct_marketing',
    label: 'Direct Marketing',
    entityLabel: 'Business',
    templateFamily: 'base',
    extraClause: 'marketing',
  },
  transport: {
    code: 'transport',
    label: 'Transport (logistics, ride-hailing, fleet)',
    entityLabel: 'Operator',
    templateFamily: 'base',
    extraClause: 'transport',
  },
  telecom: {
    code: 'telecom',
    label: 'Telecommunications and Internet Service Providers',
    entityLabel: 'Provider',
    templateFamily: 'base',
    extraClause: 'telecom',
  },
  gaming: {
    code: 'gaming',
    label: 'Gaming and Betting',
    entityLabel: 'Operator',
    templateFamily: 'base',
    extraClause: 'gaming',
  },
  genetic_data: {
    code: 'genetic_data',
    label: 'Genetic Data Processing',
    entityLabel: 'Processor',
    templateFamily: 'base',
    extraClause: 'genetic',
  },
  other: {
    code: 'other',
    label: 'Other ODPC-regulated activity',
    entityLabel: 'Client',
    templateFamily: 'base',
    extraClause: null,
  },
};

export const SECTOR_LIST = Object.values(SECTORS);

export function getSector(code: string | null | undefined): SectorConfig {
  if (code && code in SECTORS) {
    return SECTORS[code as SectorCode];
  }
  return SECTORS.other;
}

export const SECTOR_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SECTORS).map((s) => [s.code, s.label])
);