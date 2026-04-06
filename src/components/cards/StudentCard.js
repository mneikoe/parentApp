import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { textPrimary, textSecondary, radius } from '../../theme/colors'
import Card from '../common/Card'

export default function StudentCard({ childName, className, bus, attendancePct }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.name}>{childName}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Class</Text>
        <Text style={styles.value}>{className}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Bus</Text>
        <Text style={styles.value}>{bus}</Text>
      </View>
      <View style={styles.attendanceRow}>
        <View style={styles.pill}>
          <Text style={styles.pillValue}>{attendancePct}%</Text>
          <Text style={styles.pillLabel}>Attendance</Text>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  name: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  row: {
    marginTop: 10,
  },
  label: {
    color: textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  value: {
    color: textPrimary,
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  attendanceRow: {
    marginTop: 14,
  },
  pill: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.35)',
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    minWidth: 140,
    maxWidth: '100%',
  },
  pillValue: {
    color: '#22C55E',
    fontWeight: '900',
    fontSize: 22,
  },
  pillLabel: {
    color: textSecondary,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
})

