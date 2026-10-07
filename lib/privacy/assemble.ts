import { getSector } from '@/lib/sectors';
import { educationTemplate } from './education';
import { healthcareTemplate } from './healthcare';
import { financeTemplate } from './finance';
import { publicTemplate } from './public';
import { baseTemplate } from './base';
import { clauses, Clause } from './clauses';

export type AssembledSection = {
  heading: string;
  paragraphs: string[];
  items?: string[];
};

export type AssembledNotice = {
  intro: string;
  sections: AssembledSection[];
};

function section(
  heading: string,
  paragraphs: string[],
  items?: string[]
): AssembledSection {
  return { heading, paragraphs, items };
}

function baseSections() {
  const b = baseTemplate;
  return {
    whoWeAre: section(b.whoWeAreSection.heading, b.whoWeAreSection.paragraphs),
    personalData: section(b.personalDataSection.heading, b.personalDataSection.paragraphs),
    lawfulBasis: section(
      b.lawfulBasisSection.heading,
      b.lawfulBasisSection.paragraphs,
      b.lawfulBasisSection.items
    ),
    sensitiveData: section(b.sensitiveDataSection.heading, b.sensitiveDataSection.paragraphs),
    transfers: section(b.transfersSection.heading, b.transfersSection.paragraphs),
    security: section(b.securitySection.heading, b.securitySection.paragraphs),
    rights: section(b.rightsSection.heading, b.rightsSection.paragraphs, b.rightsSection.items),
    retention: section(b.retentionSection.heading, b.retentionSection.paragraphs),
    sharing: section(b.sharingSection.heading, b.sharingSection.paragraphs),
    breach: section(b.breachSection.heading, b.breachSection.paragraphs),
    complaints: section(b.complaintsSection.heading, b.complaintsSection.paragraphs),
    changes: section(b.changesSection.heading, b.changesSection.paragraphs),
  };
}

function extraClauseSection(clauseKey: string | null): AssembledSection | null {
  if (!clauseKey) return null;
  const clause: Clause | undefined = clauses[clauseKey];
  if (!clause) return null;
  return section(clause.heading, clause.paragraphs);
}

export function assembleNotice(sectorCode: string | null | undefined): AssembledNotice {
  const sector = getSector(sectorCode);
  const family = sector.templateFamily;
  const base = baseSections();

  const sections: AssembledSection[] = [];

  sections.push(base.whoWeAre);
  sections.push(base.personalData);

  let intro = baseTemplate.intro;

  const extraClause = extraClauseSection(sector.extraClause);

  if (family === 'education') {
    const t = educationTemplate;
    intro = t.intro;
    sections.push(section(t.childrenSection.heading, t.childrenSection.paragraphs));
    sections.push(section(t.publicationSection.heading, t.publicationSection.paragraphs));
    sections.push(section(t.cctvSection.heading, t.cctvSection.paragraphs));
    sections.push(section(t.edtechSection.heading, t.edtechSection.paragraphs));

    if (extraClause) sections.push(extraClause);

    sections.push(section('Lawful Basis for Processing', [t.lawfulBasisNote]));
    sections.push(base.transfers);
    sections.push(base.security);
    sections.push(base.rights);
    sections.push(section('Data Retention', [t.retentionNote]));
    sections.push(base.sharing);
    sections.push(base.breach);
    sections.push(base.complaints);
    sections.push(base.changes);
    sections.push(section('Additional Obligations', [], t.additionalNotes));

    return { intro, sections };
  }

  if (family === 'healthcare') {
    const t = healthcareTemplate;
    intro = t.intro;
    sections.push(section(t.sensitiveDataSection.heading, t.sensitiveDataSection.paragraphs));
    sections.push(section(t.confidentialitySection.heading, t.confidentialitySection.paragraphs));
    sections.push(section(t.nextOfKinSection.heading, t.nextOfKinSection.paragraphs));
    sections.push(section(t.childrensHealthSection.heading, t.childrensHealthSection.paragraphs));
    sections.push(section(t.researchSection.heading, t.researchSection.paragraphs));
    sections.push(section(t.insuranceSection.heading, t.insuranceSection.paragraphs));

    if (extraClause) sections.push(extraClause);

    sections.push(section('Lawful Basis for Processing', [t.lawfulBasisNote]));
    sections.push(base.transfers);
    sections.push(base.security);
    sections.push(base.rights);
    sections.push(section('Data Retention', [t.retentionNote]));
    sections.push(base.sharing);
    sections.push(base.breach);
    sections.push(base.complaints);
    sections.push(base.changes);
    sections.push(section('Additional Obligations', [], t.additionalNotes));

    return { intro, sections };
  }

  if (family === 'finance') {
    const t = financeTemplate;
    intro = t.intro;
    sections.push(section(t.kycSection.heading, t.kycSection.paragraphs));
    sections.push(section(t.amlSection.heading, t.amlSection.paragraphs));
    sections.push(section(t.creditSection.heading, t.creditSection.paragraphs));
    sections.push(section(t.crossBorderSection.heading, t.crossBorderSection.paragraphs));
    sections.push(section(t.fraudSection.heading, t.fraudSection.paragraphs));

    if (extraClause) sections.push(extraClause);

    sections.push(section('Lawful Basis for Processing', [t.lawfulBasisNote]));
    sections.push(base.transfers);
    sections.push(base.security);
    sections.push(base.rights);
    sections.push(section('Data Retention', [t.retentionNote]));
    sections.push(base.sharing);
    sections.push(base.breach);
    sections.push(base.complaints);
    sections.push(base.changes);
    sections.push(section('Additional Obligations', [], t.additionalNotes));

    return { intro, sections };
  }

  if (family === 'public') {
    const t = publicTemplate;
    intro = t.intro;
    sections.push(section(t.publicTaskSection.heading, t.publicTaskSection.paragraphs));
    sections.push(section(t.legalObligationSection.heading, t.legalObligationSection.paragraphs));
    sections.push(section(t.transparencySection.heading, t.transparencySection.paragraphs));
    sections.push(section(t.serviceDeliverySection.heading, t.serviceDeliverySection.paragraphs));
    sections.push(section(t.complaintsSection.heading, t.complaintsSection.paragraphs));

    if (extraClause) sections.push(extraClause);

    sections.push(section('Lawful Basis for Processing', [t.lawfulBasisNote]));
    sections.push(base.transfers);
    sections.push(base.security);
    sections.push(base.rights);
    sections.push(section('Data Retention', [t.retentionNote]));
    sections.push(base.sharing);
    sections.push(base.breach);
    sections.push(base.complaints);
    sections.push(base.changes);
    sections.push(section('Additional Obligations', [], t.additionalNotes));

    return { intro, sections };
  }

  if (extraClause) sections.push(extraClause);

  sections.push(base.lawfulBasis);
  sections.push(base.sensitiveData);
  sections.push(base.transfers);
  sections.push(base.security);
  sections.push(base.rights);
  sections.push(base.retention);
  sections.push(base.sharing);
  sections.push(base.breach);
  sections.push(base.complaints);
  sections.push(base.changes);

  return { intro, sections };
}