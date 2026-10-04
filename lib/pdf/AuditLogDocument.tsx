import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

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
    borderBottomColor: '#0A3D62',
    paddingBottom: 10,
    marginBottom: 20,
  },
  firmName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0A3D62',
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 9,
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
  refBlock: {
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 20,
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0A3D62',
    marginTop: 16,
    marginBottom: 8,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fafafa',
    padding: 10,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 10,
    marginBottom: 6,
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
  cellNo: {
    width: '8%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#999',
    textAlign: 'center',
  },
  cellWhen: {
    width: '32%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#999',
  },
  cellAction: {
    width: '60%',
    padding: 6,
  },
  headerCellNo: {
    width: '8%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#999',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    fontSize: 9,
  },
  headerCellWhen: {
    width: '32%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#999',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  headerCellAction: {
    width: '60%',
    padding: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  certificationText: {
    marginTop: 12,
    fontSize: 10,
    textAlign: 'justify',
  },
  signatureBlock: {
    marginTop: 40,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#111',
    width: '60%',
    marginTop: 30,
    paddingTop: 4,
    fontSize: 10,
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

const actionLabels: Record<string, string> = {
  client_created: 'Client registered on Praxis',
  intake_submitted: 'Compliance intake form completed',
  intake_updated: 'Compliance intake form updated',
  certificate_recorded: 'ODPC certificate recorded',
  dsar_logged: 'Data subject request logged',
  breach_reported: 'Data breach reported',
};

function humanize(action: string) {
  if (actionLabels[action]) return actionLabels[action];
  return action.replace(/_/g, ' ');
}

type Entry = {
  action: string;
  created_at: string;
};

type Props = {
  firmName: string;
  firmEmail: string;
  firmPhone: string;
  clientName: string;
  clientSector: string;
  clientCounty: string;
  clientContact: string;
  reference: string;
  today: string;
  entries: Entry[];
};

export function AuditLogDocument(props: Props) {
  const contactBits = [props.firmEmail, props.firmPhone].filter(Boolean).join(' | ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.firmName}>{props.firmName}</Text>
          <Text style={styles.headerSubtitle}>
            Data Protection Compliance - Audit Trail
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Client:</Text>
          <Text style={styles.metaValue}>{props.clientName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Sector:</Text>
          <Text style={styles.metaValue}>{props.clientSector}</Text>
        </View>
        {props.clientCounty ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>County:</Text>
            <Text style={styles.metaValue}>{props.clientCounty}</Text>
          </View>
        ) : null}
        {props.clientContact ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Contact:</Text>
            <Text style={styles.metaValue}>{props.clientContact}</Text>
          </View>
        ) : null}

        <View style={styles.refBlock}>
          <Text>Date: {props.today}</Text>
          <Text>Reference: {props.reference}</Text>
        </View>

        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            This document records every compliance action taken by {props.firmName}{' '}
            on behalf of {props.clientName} under the Data Protection Act, 2019.
            It is maintained as part of the firm's statutory record-keeping
            obligations.
          </Text>
          <Text style={styles.summaryText}>
            Total actions recorded: {props.entries.length}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Action Log</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.headerCellNo}>No.</Text>
            <Text style={styles.headerCellWhen}>Date and Time</Text>
            <Text style={styles.headerCellAction}>Action</Text>
          </View>

          {props.entries.length === 0 ? (
            <View style={styles.tableRowLast}>
              <Text style={styles.cellNo}>-</Text>
              <Text style={styles.cellWhen}>-</Text>
              <Text style={styles.cellAction}>No actions recorded yet.</Text>
            </View>
          ) : (
            props.entries.map((entry, i) => {
              const when = new Date(entry.created_at).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const isLast = i === props.entries.length - 1;
              return (
                <View key={i} style={isLast ? styles.tableRowLast : styles.tableRow}>
                  <Text style={styles.cellNo}>{i + 1}</Text>
                  <Text style={styles.cellWhen}>{when}</Text>
                  <Text style={styles.cellAction}>{humanize(entry.action)}</Text>
                </View>
              );
            })
          )}
        </View>

        <Text style={styles.sectionTitle}>Certification</Text>
        <Text style={styles.certificationText}>
          This audit trail was generated automatically from the Praxis compliance
          platform and reflects every action recorded against this client. It is
          provided for the purpose of demonstrating compliance under the Data
          Protection Act, 2019 and the Data Protection (General) Regulations,
          2021.
        </Text>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine}>
            <Text>Data Protection Officer</Text>
            <Text>{props.firmName}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Generated by Praxis - ODPC Compliance Infrastructure.</Text>
          <Text>
            {props.firmName} | {props.clientName} | {props.today}
          </Text>
        </View>
      </Page>
    </Document>
  );
}