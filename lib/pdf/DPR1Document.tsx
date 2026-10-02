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
  table: {
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCell: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  tableCellLast: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  tableHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableHintText: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#333',
    marginTop: 2,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  signatureBlock: {
    marginTop: 24,
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

const sensitiveCategories = [
  'Racial or ethnic origin',
  'Political opinion or adherence',
  'Religious or philosophical beliefs',
  'Marital status and family details',
  'Physical or mental health or condition',
  'Sexual orientation, practices or preferences',
  'Biometric data',
];

const employeeOptions = ['1-9', '10-49', '50-99', 'More than 99'];

const turnoverOptions = [
  'Less than KES 2,000,000',
  'KES 2,000,000 - 5,000,000',
  'KES 5,000,000 - 10,000,000',
  'KES 10,000,000 - 50,000,000',
  'More than KES 50,000,000',
];

function CheckBox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <View style={styles.checkboxRow}>
      <View style={checked ? styles.checkboxBoxChecked : styles.checkboxBox} />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
  );
}

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
          <Text style={styles.subtitleSmall}>
            REGISTRATION OF DATA CONTROLLERS AND DATA PROCESSORS
          </Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.sectionHeader}>SECTION 1 - BASIC DETAILS</Text>
        <Text style={{ marginBottom: 4, marginTop: 2 }}>
          Indicate if you are registering as a:
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

        <Text style={styles.sectionHeader}>
          SECTION 2 - PERSONAL DATA TO BE PROCESSED
        </Text>
        <Text style={{ fontSize: 8.5, marginBottom: 4 }}>
          Provide the details of the various subsets of personal data being
          processed and the purpose of processing.
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableCell, { width: '30%' }]}>
              <Text style={styles.tableHeaderText}>
                CATEGORY OF DATA SUBJECTS
              </Text>
              <Text style={styles.tableHintText}>
                (E.g. employee, client, students, supplier, shareholder)
              </Text>
            </View>
            <View style={[styles.tableCell, { width: '35%' }]}>
              <Text style={styles.tableHeaderText}>
                DESCRIPTION OF PERSONAL DATA
              </Text>
              <Text style={styles.tableHintText}>
                (E.g. name, address, Identification number)
              </Text>
            </View>
            <View style={[styles.tableCellLast, { width: '35%' }]}>
              <Text style={styles.tableHeaderText}>PURPOSE OF PROCESSING</Text>
              <Text style={styles.tableHintText}>
                (E.g. payroll, invoicing, KYC, registration)
              </Text>
            </View>
          </View>
          {activities.length === 0 ? (
            <View style={styles.tableRowLast}>
              <View style={[styles.tableCell, { width: '30%' }]}>
                <Text>-</Text>
              </View>
              <View style={[styles.tableCell, { width: '35%' }]}>
                <Text>-</Text>
              </View>
              <View style={[styles.tableCellLast, { width: '35%' }]}>
                <Text>-</Text>
              </View>
            </View>
          ) : (
            activities.map((a, i) => (
              <View
                key={i}
                style={i === activities.length - 1 ? styles.tableRowLast : styles.tableRow}
              >
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text>{a.data_subject_category}</Text>
                </View>
                <View style={[styles.tableCell, { width: '35%' }]}>
                  <Text>{a.personal_data_description}</Text>
                </View>
                <View style={[styles.tableCellLast, { width: '35%' }]}>
                  <Text>{a.purpose_of_processing}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionHeader}>
          SECTION 3 - SENSITIVE PERSONAL DATA
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          <CheckBox checked={sensitive?.applicable === true} label="Applicable" />
          <CheckBox checked={sensitive?.applicable !== true} label="Not Applicable" />
        </View>

        {sensitive?.applicable && (
          <>
            <Text style={{ marginBottom: 4, marginTop: 4 }}>
              Please select the type(s) of sensitive categories of personal data
              you process:
            </Text>
            {sensitiveCategories.map((cat, i) => (
              <View key={i} style={styles.checklistItem}>
                <View
                  style={
                    (sensitive.data_types || []).includes(cat)
                      ? styles.checkboxBoxChecked
                      : styles.checkboxBox
                  }
                />
                <Text>{cat}</Text>
              </View>
            ))}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Purpose:</Text>
              <Text style={styles.fieldValue}>{sensitive.purpose || '-'}</Text>
            </View>
          </>
        )}

        <Text style={styles.sectionHeader}>
          SECTION 4 - TRANSFER OF DATA OUTSIDE KENYA
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          <CheckBox checked={transfers?.applicable === true} label="Applicable" />
          <CheckBox checked={transfers?.applicable !== true} label="Not Applicable" />
        </View>

        {transfers?.applicable && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>List the country(ies):</Text>
            <Text style={styles.fieldValue}>
              {(transfers.countries || []).join(', ') || '-'}
            </Text>
          </View>
        )}

        <Text style={styles.sectionHeader}>
          SECTION 5 - MEASURES FOR PROTECTION OF PERSONAL DATA
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableCell, { width: '8%' }]}>
              <Text style={styles.tableHeaderText}>No.</Text>
            </View>
            <View style={[styles.tableCell, { width: '46%' }]}>
              <Text style={styles.tableHeaderText}>
                IDENTIFY RISKS TO PERSONAL DATA
              </Text>
              <Text style={styles.tableHintText}>
                (E.g. unauthorized access/disclosure, theft)
              </Text>
            </View>
            <View style={[styles.tableCellLast, { width: '46%' }]}>
              <Text style={styles.tableHeaderText}>
                SAFEGUARDS / SECURITY MEASURES
              </Text>
              <Text style={styles.tableHintText}>
                (E.g. access control, privacy policy, information security policy)
              </Text>
            </View>
          </View>
          {measures.length === 0 ? (
            <View style={styles.tableRowLast}>
              <View style={[styles.tableCell, { width: '8%' }]}>
                <Text>1</Text>
              </View>
              <View style={[styles.tableCell, { width: '46%' }]}>
                <Text>-</Text>
              </View>
              <View style={[styles.tableCellLast, { width: '46%' }]}>
                <Text>-</Text>
              </View>
            </View>
          ) : (
            measures.map((m, i) => (
              <View
                key={i}
                style={i === measures.length - 1 ? styles.tableRowLast : styles.tableRow}
              >
                <View style={[styles.tableCell, { width: '8%' }]}>
                  <Text>{i + 1}</Text>
                </View>
                <View style={[styles.tableCell, { width: '46%' }]}>
                  <Text>{m.risk_description}</Text>
                </View>
                <View style={[styles.tableCellLast, { width: '46%' }]}>
                  <Text>{m.safeguard_description}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionHeader}>SECTION 6 - NUMBER OF EMPLOYEES</Text>
        <Text style={{ fontSize: 8.5, marginBottom: 4 }}>Indicate by ticking:</Text>
        {employeeOptions.map((opt, i) => (
          <CheckBox key={i} checked={school.employee_count === opt} label={opt} />
        ))}

        <Text style={styles.sectionHeader}>
          SECTION 7 - PREVIOUS YEAR ANNUAL TURNOVER
        </Text>
        <Text style={{ fontSize: 8.5, marginBottom: 4 }}>Indicate by ticking:</Text>
        {turnoverOptions.map((opt, i) => {
          const stored = school.turnover_range || '';
          const matches =
            (stored === '<2M' && opt === 'Less than KES 2,000,000') ||
            (stored === '2M-5M' && opt === 'KES 2,000,000 - 5,000,000') ||
            (stored === '5M-10M' && opt === 'KES 5,000,000 - 10,000,000') ||
            (stored === '10M-50M' && opt === 'KES 10,000,000 - 50,000,000') ||
            (stored === '50M+' && opt === 'More than KES 50,000,000');
          return <CheckBox key={i} checked={matches} label={opt} />;
        })}

        <View style={styles.signatureBlock}>
          <Text style={styles.signatureText}>
            I certify that the particulars provided are correct and complete and
            hereby apply to be registered as a Data Controller or a Data
            Processor.
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