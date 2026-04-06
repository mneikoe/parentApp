import React from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { textPrimary, textSecondary, radius } from '../../theme/colors'
import { TabSafeScrollView } from '../../components/common/SafeScrollView'
import AppHeader from '../../components/common/AppHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import FeeCard from '../../components/cards/FeeCard'
import { mockFees } from '../../utils/mockData'
import useResponsiveLayout from '../../hooks/useResponsiveLayout'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

export default function FeesScreen() {
  const tabBarHeight = useBottomTabBarHeight()
  const layout = useResponsiveLayout({ tabBarHeight })

  return (
    <TabSafeScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Fees" subtitle="UI-only payment actions" />

      <FeeCard totalDue={mockFees.totals.totalDue} paid={mockFees.totals.paid} />

      <View style={styles.historyCard}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {mockFees.history.map((h) => (
          <View
            key={h.id}
            style={[
              styles.row,
              layout.isCompact && styles.rowStacked,
            ]}
          >
            <View style={[styles.rowLeft, layout.isCompact && styles.rowLeftFull]}>
              <Text style={styles.dateText}>{h.date}</Text>
              <Text style={styles.labelText}>{h.label}</Text>
            </View>
            <View style={[styles.amountWrap, layout.isCompact && styles.amountWrapStacked]}>
              {h.credit ? (
                <Badge tone="success">+ ₹ {h.credit.toLocaleString('en-IN')}</Badge>
              ) : (
                <Badge tone="warning">₹ {h.debit.toLocaleString('en-IN')}</Badge>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.paymentWrap}>
        <Button
          variant="primary"
          onPress={() => Alert.alert('Payment UI only', 'Backend payment flow is not implemented in Phase 1.')}
          accessibilityLabel="Pay now"
        >
          Pay Fees
        </Button>
        <Text style={styles.helper}>This button is UI-only. No payment is processed.</Text>
      </View>
    </TabSafeScrollView>
  )
}

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    padding: 16,
  },
  sectionTitle: { color: textPrimary, fontWeight: '900', fontSize: 16, marginBottom: 10 },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,234,242,1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowStacked: {
    alignItems: 'stretch',
  },
  rowLeft: { flex: 1, paddingRight: 10, minWidth: 0 },
  rowLeftFull: {
    paddingRight: 0,
    width: '100%',
  },
  dateText: { color: textSecondary, fontWeight: '800', fontSize: 12 },
  labelText: { color: textPrimary, fontWeight: '800', fontSize: 13, marginTop: 4, flexShrink: 1 },
  amountWrap: { alignItems: 'flex-end' },
  amountWrapStacked: {
    alignItems: 'flex-start',
    width: '100%',
  },
  paymentWrap: { marginTop: 2, alignItems: 'stretch' },
  helper: {
    marginTop: 10,
    color: textSecondary,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 12,
  },
})
