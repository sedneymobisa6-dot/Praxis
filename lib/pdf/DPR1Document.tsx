import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#e5e5e5',
    padding: 4,
    marginTop: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 4,
  },
  label: {
    width: '40%',
    fontFamily: 'Helvetica-Bold',
  },
  value: {
    width: '60%',
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e5e5',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    flex: 1,
  },
  tableCellLast: {
    padding: 4,
    flex: 1,
  },
  tableHeaderCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  tableHeaderCellLast: {
    padding: 4,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  checkbox: {
    marginRight: 4,
  },
  signatureBlock: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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

type Activity = {
  data_subject_category: string;
  personal_data_description: string;
  purpose_of_processing: string;
};

type Sensitive = {
  applicable: boolean;
  data_types: string[];
  purpose: string | null;
};

type Transfers = {
  applicable: boolean;
  countries: string[];
};

type Measure = {
  risk_description: string;
  safeguard_description: string;
};

export function DPR1Document({
  school,
  activities,
  sensitive,
  transfers,
  measures,
}: {
  school: School;
  activities: Activity[];
  sensitive: Sensitive | null;
  transfers: Transfers | null;
  measures: Measure[];
}) {
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>REPUBLIC OF KENYA</Text>
          <Text style={styles.subtitle}>DATA PROTECTION ACT, 2019</Text>
          <Text style={styles.subtitle}>FORM DPR 1</Text>
          <Text style={{ marginTop: 4 }}>REGISTRATION OF DATA CONTROLLERS AND DATA PROCESSORS</Text>
        </View>

        <Text style={styles.sectionHeader}>SECTION 1 — BASIC DETAILS</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{school.school_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Postal Address:</Text>
          <Text style={styles.value}>{school.postal_address || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Telephone Number:</Text>
          <Text style={styles.value}>{school.telephone || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email Address:</Text>
          <Text style={styles.value}>{school.email || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>County:</Text>
          <Text style={styles.value}>{school.county || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Country:</Text>
          <Text style={styles.value}>{school.country || 'Kenya'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sector:</Text>
          <Text style={styles.value}>{school.sector || 'Education'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Legal Establishment:</Text>
          <Text style={styles.value}>{school.legal_establishment || '-'}</Text>
        </View>

        <Text style={styles.sectionHeader}>SECTION 2 — PERSONAL DATA PROCESSED</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Category of Data Subjects</Text>
            <Text style={styles.tableHeaderCell}>Description of Personal Data</Text>
            <Text style={styles.tableHeaderCellLast}>Purpose of Processing</Text>
          </View>
          {activities.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>-</Text>
              <Text style={styles.tableCell}>-</Text>
              <Text style={styles.tableCellLast}>-</Text>
            </View>
          ) : (
            activities.map((a, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{a.data_subject_category}</Text>
                <Text style={styles.tableCell}>{a.personal_data_description}</Text>
                <Text style={styles.tableCellLast}>{a.purpose_of_processing}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionHeader}>SECTION 3 — SENSITIVE PERSONAL DATA</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Applicable:</Text>
          <Text style={styles.value}>{sensitive?.applicable ? 'Yes' : 'No'}</Text>
        </View>
        {sensitive?.applicable && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Types:</Text>
              <Text style={styles.value}>{(sensitive.data_types || []).join(', ') || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Purpose:</Text>
              <Text style={styles.value}>{sensitive.purpose || '-'}</Text>
            </View>
          </>
        )}

        <Text style={styles.sectionHeader}>SECTION 4 — TRANSFER OF DATA OUTSIDE KENYA</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Applicable:</Text>
          <Text style={styles.value}>{transfers?.applicable ? 'Yes' : 'No'}</Text>
        </View>
        {transfers?.applicable && (
          <View style={styles.row}>
            <Text style={styles.label}>Countries:</Text>
            <Text style={styles.value}>{(transfers.countries || []).join(', ') || '-'}</Text>
          </View>
        )}

        <Text style={styles.sectionHeader}>SECTION 5 — MEASURES FOR PROTECTION OF PERSONAL DATA</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Risk</Text>
            <Text style={styles.tableHeaderCellLast}>Safeguard / Security Measure</Text>
          </View>
          {measures.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>-</Text>
              <Text style={styles.tableCellLast}>-</Text>
            </View>
          ) : (
            measures.map((m, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{m.risk_description}</Text>
                <Text style={styles.tableCellLast}>{m.safeguard_description}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionHeader}>SECTION 6 — NUMBER OF EMPLOYEES</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{school.employee_count || '-'} employees</Text>
        </View>

        <Text style={styles.sectionHeader}>SECTION 7 — PREVIOUS YEAR ANNUAL TURNOVER</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{school.turnover_range || '-'}</Text>
        </View>

        <View style={styles.signatureBlock}>
          <Text>
            I certify that the particulars provided are correct and complete and hereby apply to be
            registered as a Data Controller or Data Processor.
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