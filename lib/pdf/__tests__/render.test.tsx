import { describe, it, expect } from 'vitest';
import React from 'react';
import { DPR1Document } from '../DPR1Document';
import { DPR2Document } from '../DPR2Document';
import { AuditLogDocument } from '../AuditLogDocument';

const sampleSchool = {
  school_name: 'Riverside Medical Centre',
  postal_address: 'P.O. Box 1234-00100, Nairobi',
  telephone: '+254 700 000 000',
  email: 'admin@riverside.co.ke',
  county: 'Nairobi',
  country: 'Kenya',
  sector: 'healthcare',
  legal_establishment: 'Certificate of Incorporation',
  employee_count: '10-49',
  turnover_range: '2M-5M',
};

const sampleActivities = [
  {
    data_subject_category: 'Patients',
    personal_data_description: 'Name, ID number, medical history',
    purpose_of_processing: 'Providing medical care and treatment',
  },
];

const sampleSensitive = {
  applicable: true,
  data_types: ['Physical or mental health or condition'],
  purpose: 'Medical treatment',
};

const sampleTransfers = {
  applicable: false,
  countries: [],
};

const sampleMeasures = [
  {
    risk_description: 'Unauthorized access',
    safeguard_description: 'Role based access control and audit logs',
  },
];

describe('DPR1Document', () => {
  it('can be constructed with valid props', () => {
    const element = React.createElement(DPR1Document, {
      school: sampleSchool,
      activities: sampleActivities,
      sensitive: sampleSensitive,
      transfers: sampleTransfers,
      measures: sampleMeasures,
    });

    expect(element).toBeTruthy();
    expect(element.type).toBe(DPR1Document);
    expect(element.props.school.school_name).toBe('Riverside Medical Centre');
  });

  it('handles empty activities', () => {
    const element = React.createElement(DPR1Document, {
      school: sampleSchool,
      activities: [],
      sensitive: null,
      transfers: null,
      measures: [],
    });

    expect(element.props.activities).toEqual([]);
    expect(element.props.sensitive).toBe(null);
  });
});

describe('DPR2Document', () => {
  const previous = {
    certificate_number: 'ODPC/2024/001234',
    issued_at: '2024-01-15T00:00:00Z',
    expires_at: '2026-01-15T00:00:00Z',
  };

  it('can be constructed with valid props', () => {
    const element = React.createElement(DPR2Document, {
      school: sampleSchool,
      previous,
    });

    expect(element).toBeTruthy();
    expect(element.type).toBe(DPR2Document);
    expect(element.props.previous.certificate_number).toBe('ODPC/2024/001234');
  });

  it('handles missing previous certificate number', () => {
    const element = React.createElement(DPR2Document, {
      school: sampleSchool,
      previous: { ...previous, certificate_number: null },
    });

    expect(element.props.previous.certificate_number).toBe(null);
  });
});

describe('AuditLogDocument', () => {
  const props = {
    firmName: 'Wangai and Associates Advocates',
    firmEmail: 'contact@wangai.co.ke',
    firmPhone: '+254 700 000 000',
    clientName: 'Riverside Medical Centre',
    clientSector: 'Healthcare',
    clientCounty: 'Nairobi',
    clientContact: 'admin@riverside.co.ke',
    reference: 'AUDIT/ABC12345',
    today: '07 October 2026',
    entries: [
      {
        action: 'client_created',
        created_at: '2026-10-01T10:00:00Z',
      },
      {
        action: 'intake_submitted',
        created_at: '2026-10-02T11:30:00Z',
      },
    ],
  };

  it('can be constructed with valid props', () => {
    const element = React.createElement(AuditLogDocument, props);

    expect(element).toBeTruthy();
    expect(element.type).toBe(AuditLogDocument);
    expect(element.props.entries.length).toBe(2);
  });

  it('handles empty entries', () => {
    const element = React.createElement(AuditLogDocument, {
      ...props,
      entries: [],
    });

    expect(element.props.entries).toEqual([]);
  });
});