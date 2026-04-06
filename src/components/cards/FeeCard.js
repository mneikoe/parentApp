import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { radius, textPrimary, textSecondary, primary } from '../../theme/colors'
import Card from '../common/Card'

export default function FeeCard({ totalDue, paid }) {
  const balance = Math.max(0, Number(totalDue || 0) - Number(paid || 0))
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Total Due</Text>
          <Text style={styles.kpiValue}>₹ {Number(totalDue || 0).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Paid</Text>
          <Text style={styles.kpiValue}>₹ {Number(paid || 0).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.balancePill}>
        <Text style={styles.balanceText}>
          Balance: <Text style={styles.balanceAmount}>₹ {balance.toLocaleString('en-IN')}</Text>
        </Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  kpi: {
    flex: 1,
  },
  kpiLabel: {
    color: textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  kpiValue: {
    marginTop: 8,
    color: textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  balancePill: {
    marginTop: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.35)',
    backgroundColor: 'rgba(37,99,235,0.12)',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  balanceText: {
    color: textSecondary,
    fontWeight: '800',
  },
  balanceAmount: {
    color: primary,
    fontWeight: '900',
  },
})

