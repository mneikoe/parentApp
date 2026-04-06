import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { radius, surface, textSecondary } from '../../theme/colors'
import Card from '../common/Card'

export default function AttendanceCard({ title, value, tone = 'primary', style }) {
  const colorsForTone = {
    primary: { color: '#2563EB', background: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.35)' },
    success: { color: '#22C55E', background: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
    warning: { color: '#F59E0B', background: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
    danger: { color: '#EF4444', background: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' },
  }

  const t = colorsForTone[tone] || colorsForTone.primary

  return (
    <Card style={[styles.card, { backgroundColor: surface }, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.valueWrap}>
        <View style={[styles.valuePill, { borderColor: t.border, backgroundColor: t.background }]}>
          <Text style={[styles.value, { color: t.color }]}>{value}</Text>
        </View>
      </View>
      <Text style={styles.sub}>Today</Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: textSecondary,
    fontWeight: '800',
    fontSize: 12,
  },
  valueWrap: {
    marginTop: 10,
  },
  valuePill: {
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
  },
  sub: {
    marginTop: 8,
    color: textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
})

