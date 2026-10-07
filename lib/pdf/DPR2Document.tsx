import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 45,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    lineHeight: 1.45,
    color: '#000',
  },
  header: {
    textAlign: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  subtitleSmall: {
    fontSize: 9.5,
    marginTop: 3,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginTop: 10,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#e8e8e8',
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  fieldRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
  },
  fieldLabel: {
    width: '42%',
    fontFamily: 'Helvetica-Bold',
    paddingRight: 6,
  },
  fieldValue: {
    width: '58%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 2,
  },
  checkboxBox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 5,
    marginLeft: 4,
  },
  checkboxBoxChecked: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 5,
    marginLeft: 4,
    backgroundColor: '#000',
  },
  checkboxLabel: {
    marginRight: 14,
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 6,
    fontSize: 9,
  },
  signatureBlock: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10,
  },
  signatureText: {
    fontSize: 9,
    marginBottom: 20,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: '45%',
    paddingTop: 4,
  },
});

type School = {
  school_name: string;
  postal_address: string | null;
  telephone: string | null;
  email: string | null;
  county: string | null;
  country: string | null;
  sector: string | null;
  legal_establishment: string | null;
  employee_count: string | null;
  turnover_range: string | null;
};

type PreviousCertificate = {
  certificate_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
};

function CheckBox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <View style={styles.checkboxRow}>
      <View style={checked ? styles.checkboxBoxChecked : styles.checkboxBox} />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
  );
}

function formatDateLong(dateString: string | null) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function DPR2Document({
  school,
  previous,
}: {
  school: School;
  previous: PreviousCertificate;
}) {
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>REPUBLIC OF KENYA</Text>
          <Text style={styles.subtitle}>DATA PROTECTION ACT, 2019</Text>
          <Text style={styles.subtitle}>FORM DPR 2</Text>
          <Text style={styles.subtitleSmall}>
            RENEWAL OF REGISTRATION OF DATA CONTROLLERS AND DATA PROCESSORS
          </Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.paragraph}>
          This form is to be used for the renewal of a certificate of
          registration issued under section 19 of the Data Protection Act,
          2019, in accordance with section 20 of the Act and the Data
          Protection (Registration of Data Controllers and Data Processors)
          Regulations, 2021.
        </Text>

        <Text style={styles.sectionHeader}>SECTION 1 - BASIC DETAILS</Text>
        <Text style={{ marginBottom: 4, marginTop: 2 }}>
          Indicate if you are renewing as a:
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          <CheckBox checked={true} label="Data Controller" />
          <CheckBox checked={false} label="Data Processor" />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Name:</Text>
          <Text style={styles.fieldValue}>{school.school_name}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Postal Address:</Text>
          <Text style={styles.fieldValue}>{school.postal_address || '-'}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Telephone Number:</Text>
          <Text style={styles.fieldValue}>{school.telephone || '-'}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Email Address:</Text>
          <Text style={styles.fieldValue}>{school.email || '-'}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>County:</Text>
          <Text style={styles.fieldValue}>{school.county || '-'}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Country:</Text>
          <Text style={styles.fieldValue}>{school.country || 'Kenya'}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Sector:</Text>
          <Text style={styles.fieldValue}>{school.sector || '-'}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Legal Establishment:</Text>
          <Text style={styles.fieldValue}>{school.legal_establishment || '-'}</Text>
        </View>

        <Text style={styles.sectionHeader}>SECTION 2 - DETAILS OF PREVIOUS REGISTRATION</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Previous Certificate Number:</Text>
          <Text style={styles.fieldValue}>
            {previous.certificate_number || '-'}
          </Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Date of Issue:</Text>
          <Text style={styles.fieldValue}>
            {formatDateLong(previous.issued_at)}
          </Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Date of Expiry:</Text>
          <Text style={styles.fieldValue}>
            {formatDateLong(previous.expires_at)}
          </Text>
        </View>

        <Text style={styles.sectionHeader}>SECTION 3 - DISTINCT PURPOSE</Text>

        <Text style={styles.paragraph}>
          Specify whether this renewal is for a distinct purpose or categories
          of personal data other than those for which the applicant was
          previously registered.
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 4, marginBottom: 6 }}>
          <CheckBox
            checked={false}
            label="Renewal is for the same purpose and data categories"
          />
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          <CheckBox
            checked={false}
            label="Renewal is for a distinct purpose or additional data categories"
          />
        </View>

        <Text style={styles.paragraph}>
          Where the renewal is for a distinct purpose or additional categories
          of personal data, the applicant shall provide a fresh description of
          the personal data, the purpose of processing, and the security
          measures in place, in accordance with section 19(2) of the Act.
        </Text>

        <View style={styles.signatureBlock}>
          <Text style={styles.signatureText}>
            I certify that the particulars provided in this renewal application
            are correct and complete and hereby apply to renew my registration
            as a Data Controller or Data Processor for a further period of
            twenty four months.
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureLine}>
              <Text>Signature</Text>
            </View>
            <View style={styles.signatureLine}>
              <Text>Date: {today}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}