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

function toSection(block: { heading: string; paragraphs: string[]; items?: string[] }): AssembledSection {
  return {
    heading: block.heading,
    paragraphs: block.paragraphs,
    items: block.items,
  };
}

export function assembleNotice(sectorCode: string | null | undefined): AssembledNotice {
  const sector = getSector(sectorCode);
  const family = sector.templateFamily;

  const sections: AssembledSection[] = [];

  if (family === 'education') {
    const t = educationTemplate;
    sections.push(toSection(t.childrenSection));
    sections.push(toSection(t.publicationSection));
    sections.push(toSection(t.cctvSection));
    sections.push(toSection(t.edtechSection));
    sections.push({
      heading: 'Lawful Basis for Processing',
      paragraphs: [t.lawfulBasisNote],
    });
    sections.push({
      heading: 'Data Retention',
      paragraphs: [t.retentionNote],
    });
    sections.push({
      heading: 'Additional Obligations',
      paragraphs: [],
      items: t.additionalNotes,
    });
    return {
      intro: t.intro,
      sections,
    };
  }

  if (family === 'healthcare') {
    const t = healthcareTemplate;
    sections.push(toSection(t.sensitiveDataSection));
    sections.push(toSection(t.confidentialitySection));
    sections.push(toSection(t.nextOfKinSection));
    sections.push(toSection(t.childrensHealthSection));
    sections.push(toSection(t.researchSection));
    sections.push(toSection(t.insuranceSection));
    sections.push({
      heading: 'Lawful Basis for Processing',
      paragraphs: [t.lawfulBasisNote],
    });
    sections.push({
      heading: 'Data Retention',
      paragraphs: [t.retentionNote],
    });
    sections.push({
      heading: 'Additional Obligations',
      paragraphs: [],
      items: t.additionalNotes,
    });
    return {
      intro: t.intro,
      sections,
    };
  }

  if (family === 'finance') {
    const t = financeTemplate;
    sections.push(toSection(t.kycSection));
    sections.push(toSection(t.amlSection));
    sections.push(toSection(t.creditSection));
    sections.push(toSection(t.crossBorderSection));
    sections.push(toSection(t.fraudSection));
    sections.push({
      heading: 'Lawful Basis for Processing',
      paragraphs: [t.lawfulBasisNote],
    });
    sections.push({
      heading: 'Data Retention',
      paragraphs: [t.retentionNote],
    });
    sections.push({
      heading: 'Additional Obligations',
      paragraphs: [],
      items: t.additionalNotes,
    });
    return {
      intro: t.intro,
      sections,
    };
  }

  if (family === 'public') {
    const t = publicTemplate;
    sections.push(toSection(t.publicTaskSection));
    sections.push(toSection(t.legalObligationSection));
    sections.push(toSection(t.transparencySection));
    sections.push(toSection(t.serviceDeliverySection));
    sections.push(toSection(t.complaintsSection));
    sections.push({
      heading: 'Lawful Basis for Processing',
      paragraphs: [t.lawfulBasisNote],
    });
    sections.push({
      heading: 'Data Retention',
      paragraphs: [t.retentionNote],
    });
    sections.push({
      heading: 'Additional Obligations',
      paragraphs: [],
      items: t.additionalNotes,
    });
    return {
      intro: t.intro,
      sections,
    };
  }

  const b = baseTemplate;

  sections.push(toSection(b.whoWeAreSection));
  sections.push(toSection(b.personalDataSection));

  if (sector.extraClause && clauses[sector.extraClause]) {
    const clause: Clause = clauses[sector.extraClause];
    sections.push({
      heading: clause.heading,
      paragraphs: clause.paragraphs,
    });
  }

  sections.push(toSection(b.lawfulBasisSection));
  sections.push(toSection(b.sensitiveDataSection));
  sections.push(toSection(b.transfersSection));
  sections.push(toSection(b.securitySection));
  sections.push(toSection(b.rightsSection));
  sections.push(toSection(b.retentionSection));
  sections.push(toSection(b.sharingSection));
  sections.push(toSection(b.breachSection));
  sections.push(toSection(b.complaintsSection));
  sections.push(toSection(b.changesSection));

  return {
    intro: b.intro,
    sections,
  };
}