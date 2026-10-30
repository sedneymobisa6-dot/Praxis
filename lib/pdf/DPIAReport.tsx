import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

const ODPC_BLUE = '#0A3D62';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 45,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    color: '#000',
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: ODPC_BLUE,
    paddingBottom: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: ODPC_BLUE,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#555',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    width: '25%',
    fontFamily: 'Helvetica-Bold',
  },
  metaValue: {
    width: '75%',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: ODPC_BLUE,
    backgroundColor: '#f0f0f0',
    padding: 6,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  fieldRow: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginBottom: 2,
    color: '#333',
  },
  fieldValue: {
    fontSize: 10,
    textAlign: 'justify',
  },
  table: {
    borderWidth: 1,
    borderColor: '#999',
    marginTop: 6,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  cellRisk: { width: '40%', padding: 6, borderRightWidth: 1, borderRightColor: '#999' },
  cellImpact: { width: '15%', padding: 6, borderRightWidth: 1, borderRightColor: '#999', textAlign: 'center' },
  cellLikelihood: { width: '15%', padding: 6, borderRightWidth: 1, borderRightColor: '#999', textAlign: 'center' },
  cellActions: { width: '30%', padding: 6 },
  
  headerCellRisk: { width: '40%', padding: 6, borderRightWidth: 1, borderRightColor: '#999', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  headerCellImpact: { width: '15%', padding: 6, borderRightWidth: 1, borderRightColor: '#999', fontFamily: 'Helvetica-Bold', fontSize: 8, textAlign: 'center' },
  headerCellLikelihood: { width: '15%', padding: 6, borderRightWidth: 1, borderRightColor: '#999', fontFamily: 'Helvetica-Bold', fontSize: 8, textAlign: 'center' },
  headerCellActions: { width: '30%', padding: 6, fontFamily: 'Helvetica-Bold', fontSize: 8 },

  signatureBlock: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#111',
    paddingTop: 10,
    width: '60%',
  },
  signatureText: {
    fontSize: 9,
    marginBottom: 4,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#111',
    marginTop: 30,
    paddingTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 45,
    right: 45,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
});

type RiskItem = {
  risk: string;
  impact: string;
  likelihood: string;
  actions: string;
};

type Props = {
  firmName: string;
  clientName: string;
  projectName: string;
  assessmentNeed: string;
  projectOutline: string;
  personalDataTypes: string;
  informationFlow: string;
  complianceMeasures: string;
  riskAssessment: RiskItem[];
  createdAt: string;
};

export function DPIAReport(props: Props) {
  const reference = 'DPIA/' + props.projectName.substring(0, 6).replace(/\s+/g, '').toUpperCase();
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>DATA PROTECTION IMPACT ASSESSMENT</Text>
          <Text style={styles.subtitle}>Pursuant to Section 31 of the Data Protection Act, 2019</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Data Controller:</Text>
          <Text style={styles.metaValue}>{props.clientName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Prepared By:</Text>
          <Text style={styles.metaValue}>{props.firmName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Project Name:</Text>
          <Text style={styles.metaValue}>{props.projectName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Reference:</Text>
          <Text style={styles.metaValue}>{reference}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Date Prepared:</Text>
          <Text style={styles.metaValue}>{today}</Text>
        </View>

        <Text style={styles.sectionTitle}>PART 1: DESCRIPTION OF THE PROCESSING</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>1. Assess the need for DPIA</Text>
          <Text style={styles.fieldValue}>{props.assessmentNeed}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>2. Project Outline</Text>
          <Text style={styles.fieldValue}>{props.projectOutline}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>3. Personal Data Being Processed</Text>
          <Text style={styles.fieldValue}>{props.personalDataTypes}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>4. Describe the Information Flow</Text>
          <Text style={styles.fieldValue}>{props.informationFlow}</Text>
        </View>

        <Text style={styles.sectionTitle}>PART 2: NECESSITY AND PROPORTIONALITY</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>5. Compliance and Proportionality Measures</Text>
          <Text style={styles.fieldValue}>{props.complianceMeasures}</Text>
        </View>

        <Text style={styles.sectionTitle}>PART 3: RISK ASSESSMENT AND SAFEGUARDS</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.headerCellRisk}>Risk Description</Text>
            <Text style={styles.headerCellImpact}>Impact</Text>
            <Text style={styles.headerCellLikelihood}>Likelihood</Text>
            <Text style={styles.headerCellActions}>Mitigation Actions</Text>
          </View>
          
          {props.riskAssessment.length === 0 ? (
            <View style={styles.tableRowLast}>
              <Text style={styles.cellRisk}>-</Text>
              <Text style={styles.cellImpact}>-</Text>
              <Text style={styles.cellLikelihood}>-</Text>
              <Text style={styles.cellActions}>-</Text>
            </View>
          ) : (
            props.riskAssessment.map((r, i) => {
              const isLast = i === props.riskAssessment.length - 1;
              return (
                <View key={i} style={isLast ? styles.tableRowLast : styles.tableRow}>
                  <Text style={styles.cellRisk}>{r.risk}</Text>
                  <Text style={styles.cellImpact}>{r.impact}</Text>
                  <Text style={styles.cellLikelihood}>{r.likelihood}</Text>
                  <Text style={styles.cellActions}>{r.actions}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.signatureBlock}>
          <Text style={styles.signatureText}>
            I certify that this assessment accurately reflects the risks and safeguards associated with this processing activity.
          </Text>
          <View style={styles.signatureLine}>
            <Text>Data Protection Officer / Authorized Signatory</Text>
            <Text>{props.firmName}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Generated by PRAXIS - LINDA DATA Compliance Infrastructure.</Text>
          <Text>{props.clientName} | {reference}</Text>
        </View>
      </Page>
    </Document>
  );
}