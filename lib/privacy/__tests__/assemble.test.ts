import { describe, it, expect } from 'vitest';
import { assembleNotice } from '../assemble';
import { SECTORS, SECTOR_LIST, getSector } from '@/lib/sectors';

describe('assembleNotice', () => {
  describe('every sector returns a valid notice', () => {
    for (const sector of SECTOR_LIST) {
      it('produces a notice for ' + sector.code, () => {
        const notice = assembleNotice(sector.code);

        expect(notice).toBeTruthy();
        expect(typeof notice.intro).toBe('string');
        expect(notice.intro.length).toBeGreaterThan(20);
        expect(Array.isArray(notice.sections)).toBe(true);
        expect(notice.sections.length).toBeGreaterThan(5);

        for (const section of notice.sections) {
          expect(typeof section.heading).toBe('string');
          expect(section.heading.length).toBeGreaterThan(0);
          expect(Array.isArray(section.paragraphs)).toBe(true);
        }
      });
    }
  });

  describe('the SACCO clause is applied', () => {
    it('sacco gets the SACCO Members clause', () => {
      const notice = assembleNotice('sacco');
      const headings = notice.sections.map((s) => s.heading);
      expect(headings).toContain('SACCO Members and Financial Records');
    });

    it('financial_services does not get the SACCO clause', () => {
      const notice = assembleNotice('financial_services');
      const headings = notice.sections.map((s) => s.heading);
      expect(headings).not.toContain('SACCO Members and Financial Records');
    });
  });

  describe('the insurance clause is applied', () => {
    it('insurance gets the Insurance Policyholders clause', () => {
      const notice = assembleNotice('insurance');
      const headings = notice.sections.map((s) => s.heading);
      expect(headings).toContain('Insurance Policyholders, Beneficiaries, and Claimants');
    });
  });

  describe('the debt collection clause is applied', () => {
    it('debt_collection gets the Debt Collection clause', () => {
      const notice = assembleNotice('debt_collection');
      const headings = notice.sections.map((s) => s.heading);
      expect(headings).toContain('Debt Collection and Credit Reference');
    });
  });

  describe('every sector with an extra clause produces it', () => {
    const expected: Record<string, string> = {
      sacco: 'SACCO Members and Financial Records',
      insurance: 'Insurance Policyholders, Beneficiaries, and Claimants',
      debt_collection: 'Debt Collection and Credit Reference',
      hospitality: 'Guests and Hospitality Services',
      property: 'Property Management and Real Estate',
      security_cctv: 'Security Services and CCTV Surveillance',
      faith: 'Faith Organisations and Religious Data',
      direct_marketing: 'Direct Marketing and Consent',
      transport: 'Transport Services, Drivers, and Passengers',
      telecom: 'Telecommunications and Internet Services',
      gaming: 'Gaming and Betting Operators',
      genetic_data: 'Genetic Data Processing',
    };

    for (const [code, expectedHeading] of Object.entries(expected)) {
      it(code + ' contains "' + expectedHeading + '"', () => {
        const notice = assembleNotice(code);
        const headings = notice.sections.map((s) => s.heading);
        expect(headings).toContain(expectedHeading);
      });
    }
  });

  describe('family specific sections are correct', () => {
    it('education family includes children related sections', () => {
      const notice = assembleNotice('education');
      const headings = notice.sections.map((s) => s.heading);
      expect(headings).toContain("Children's Data Protection");
      expect(headings).toContain('CCTV and Surveillance');
      expect(headings).toContain('Third-Party Educational Technology (EdTech) Providers');
    });

    it('healthcare family includes confidentiality sections', () => {
      const notice = assembleNotice('healthcare');
      const headings = notice.sections.map((s) => s.heading);
      expect(headings).toContain('Sensitive Personal Data and Health Records');
      expect(headings).toContain('Professional Secrecy and Confidentiality');
      expect(headings).toContain('Next of Kin and Emergency Contacts');
    });

    it('finance family includes KYC and AML sections', () => {
      const notice = assembleNotice('financial_services');
      const headings = notice.sections.map((s) => s.heading);
      expect(headings).toContain('Know Your Customer (KYC) and Identity Verification');
      expect(headings).toContain('Anti-Money Laundering and Suspicious Activity Reporting');
      expect(headings).toContain('Credit Information and Credit Reference Bureaus');
    });

    it('public family includes public task sections', () => {
      const notice = assembleNotice('public_bodies');
      const headings = notice.sections.map((s) => s.heading);
      expect(headings).toContain('Public Task and Official Authority');
      expect(headings).toContain('Legal Obligations and Statutory Reporting');
      expect(headings).toContain('Transparency and Public Accountability');
    });
  });

  describe('universal sections appear in every notice', () => {
    for (const sector of SECTOR_LIST) {
      it('includes "Your Rights as a Data Subject" for ' + sector.code, () => {
        const notice = assembleNotice(sector.code);
        const headings = notice.sections.map((s) => s.heading);
        expect(headings).toContain('Your Rights as a Data Subject');
      });

      it('includes "Data Breaches" for ' + sector.code, () => {
        const notice = assembleNotice(sector.code);
        const headings = notice.sections.map((s) => s.heading);
        expect(headings).toContain('Data Breaches');
      });

      it('includes "Complaints" for ' + sector.code, () => {
        const notice = assembleNotice(sector.code);
        const headings = notice.sections.map((s) => s.heading);
        expect(headings).toContain('Complaints');
      });
    }
  });

  describe('edge cases', () => {
    it('handles null input gracefully', () => {
      const notice = assembleNotice(null);
      expect(notice).toBeTruthy();
      expect(notice.sections.length).toBeGreaterThan(5);
    });

    it('handles undefined input gracefully', () => {
      const notice = assembleNotice(undefined);
      expect(notice).toBeTruthy();
      expect(notice.sections.length).toBeGreaterThan(5);
    });

    it('handles unknown sector code gracefully', () => {
      const notice = assembleNotice('some_made_up_sector');
      expect(notice).toBeTruthy();
      expect(notice.sections.length).toBeGreaterThan(5);
    });
  });
});

describe('sectors.ts helpers', () => {
  it('getSector returns the correct config', () => {
    expect(getSector('sacco').templateFamily).toBe('finance');
    expect(getSector('sacco').extraClause).toBe('sacco');
    expect(getSector('education').templateFamily).toBe('education');
    expect(getSector('education').extraClause).toBe(null);
  });

  it('getSector falls back to other on unknown code', () => {
    expect(getSector('not_a_sector').code).toBe('other');
    expect(getSector(null).code).toBe('other');
    expect(getSector(undefined).code).toBe('other');
  });

  it('SECTORS has all 17 codes', () => {
    expect(Object.keys(SECTORS).length).toBe(17);
  });
});