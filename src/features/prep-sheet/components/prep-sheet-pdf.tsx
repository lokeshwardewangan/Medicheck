import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PrepSheet } from '@/features/prep-sheet/lib/schema';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#171717',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  brand: {
    fontSize: 9,
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold' },
  meta: { fontSize: 9, color: '#737373', marginTop: 4 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 8,
    color: '#525252',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  chief: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  timelineItem: { marginBottom: 6, paddingLeft: 10, borderLeftWidth: 1.5, borderLeftColor: '#a3a3a3' },
  timelineWhen: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  timelineDesc: { fontSize: 10, color: '#404040' },
  twoCol: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  col: { flex: 1 },
  listItem: { fontSize: 10, marginBottom: 1 },
  question: { fontSize: 11, marginBottom: 6 },
  notes: { fontSize: 9, color: '#525252', fontStyle: 'italic' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    fontSize: 8,
    color: '#a3a3a3',
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#d4d4d4',
    paddingTop: 6,
  },
});

interface Props {
  memberName: string;
  prepSheet: PrepSheet;
  generatedAt?: Date;
}

export function PrepSheetDocument({ memberName, prepSheet, generatedAt = new Date() }: Props) {
  const ts = generatedAt.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Document
      title={`MediCheck prep sheet — ${memberName}`}
      author="MediCheck"
      creator="MediCheck"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>MediCheck · Doctor visit prep</Text>
          <Text style={styles.title}>{memberName}</Text>
          <Text style={styles.meta}>Generated {ts}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chief complaint</Text>
          <Text style={styles.chief}>{prepSheet.chiefComplaint}</Text>
        </View>

        {prepSheet.timeline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            {prepSheet.timeline.map((entry, i) => (
              <View key={i} style={styles.timelineItem}>
                <Text style={styles.timelineWhen}>
                  {entry.when}
                  {entry.severity != null ? ` · severity ${entry.severity}/10` : ''}
                </Text>
                <Text style={styles.timelineDesc}>{entry.description}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Current medications</Text>
            {prepSheet.currentMedications.length > 0 ? (
              prepSheet.currentMedications.map((m, i) => (
                <Text key={i} style={styles.listItem}>
                  • {m}
                </Text>
              ))
            ) : (
              <Text style={styles.listItem}>None</Text>
            )}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Active conditions</Text>
            {prepSheet.activeConditions.length > 0 ? (
              prepSheet.activeConditions.map((c, i) => (
                <Text key={i} style={styles.listItem}>
                  • {c}
                </Text>
              ))
            ) : (
              <Text style={styles.listItem}>None</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <Text style={styles.listItem}>
            {prepSheet.allergies.length > 0 ? prepSheet.allergies.join(', ') : 'None reported'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions to ask the doctor</Text>
          {prepSheet.questionsForDoctor.map((q, i) => (
            <Text key={i} style={styles.question}>
              {i + 1}. {q}
            </Text>
          ))}
        </View>

        {prepSheet.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{prepSheet.notes}</Text>
          </View>
        )}

        <Text style={styles.footer} fixed>
          Not a medical diagnosis. Bring this sheet to your doctor for discussion.
        </Text>
      </Page>
    </Document>
  );
}
