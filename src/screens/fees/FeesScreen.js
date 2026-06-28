/**
 * FeesScreen v2 — Premium financial overview screen.
 * No tables. Financial cards with progress bars + status pills.
 * Total overview ring (paid vs pending vs overdue).
 */

import React, { useEffect, useCallback, useState, useRef } from 'react'
import {
  View, Text, ScrollView, StyleSheet, Animated,
  Alert, RefreshControl,
} from 'react-native'
import {
  background, surface, card, border,
  primary, primaryLight,
  success, successLight,
  warning, warningLight,
  danger, dangerLight,
  textPrimary, textSecondary, textMuted,
  radius, spacing, layout,
} from '../../theme/colors'
import { fontSizes, fontWeights } from '../../theme/typography'
import { entrance } from '../../theme/motion'
import { useSession } from '../../context/SessionContext'
import { parentGet } from '../../utils/api'

import FeeCard        from '../../components/cards/FeeCard'
import SectionHeader  from '../../components/primitives/SectionHeader'
import AnimatedButton from '../../components/primitives/AnimatedButton'
import SkeletonCard   from '../../components/feedback/SkeletonCard'
import ErrorState     from '../../components/feedback/ErrorState'
import EmptyState     from '../../components/feedback/EmptyState'

import { TabSafeScrollView } from '../../components/common/SafeScrollView'

const FinancialOverview = ({ totals }) => {
  const total    = totals?.total    || 0
  const paid     = totals?.paid     || 0
  const pending  = totals?.pending  || 0
  const overdue  = totals?.overdue  || 0
  const paidPct  = total > 0 ? (paid / total) * 100 : 0

  return (
    <View style={ovStyles.card}>
      <View style={ovStyles.topRow}>
        <View>
          <Text style={ovStyles.label}>Total Fees</Text>
          <Text style={ovStyles.totalAmt}>₹{Number(total).toLocaleString('en-IN')}</Text>
        </View>
        <View style={ovStyles.pctBadge}>
          <Text style={ovStyles.pctText}>{Math.round(paidPct)}% Paid</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={ovStyles.barTrack}>
        <Animated.View style={[ovStyles.barFill, { width: `${paidPct}%` }]} />
      </View>

      {/* 3 summary tiles */}
      <View style={ovStyles.tiles}>
        {[
          { label: 'Paid',    value: paid,    color: success },
          { label: 'Pending', value: pending, color: warning },
          { label: 'Overdue', value: overdue, color: danger  },
        ].map((t) => (
          <View key={t.label} style={[ovStyles.tile, { backgroundColor: t.color + '18' }]}>
            <Text style={[ovStyles.tileVal, { color: t.color }]}>
              ₹{Number(t.value).toLocaleString('en-IN')}
            </Text>
            <Text style={ovStyles.tileLabel}>{t.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const ovStyles = StyleSheet.create({
  card: {
    backgroundColor: card,
    borderRadius:    radius.xxl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.xl,
    gap:             spacing.lg,
  },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  label: {
    color:      textMuted,
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalAmt: {
    color:      textPrimary,
    fontSize:   fontSizes.h2,
    fontWeight: fontWeights.black,
    marginTop:  4,
  },
  pctBadge: {
    backgroundColor: successLight,
    borderRadius:    radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.xs,
  },
  pctText: {
    color:      success,
    fontSize:   fontSizes.sub,
    fontWeight: fontWeights.bold,
  },
  barTrack: {
    height:          8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius:    4,
    overflow:        'hidden',
  },
  barFill: {
    height:          8,
    backgroundColor: success,
    borderRadius:    4,
  },
  tiles: {
    flexDirection: 'row',
    gap:           spacing.sm,
  },
  tile: {
    flex:           1,
    borderRadius:   radius.lg,
    padding:        spacing.sm,
    alignItems:     'center',
    gap:            3,
  },
  tileVal: {
    fontSize:   fontSizes.sub,
    fontWeight: fontWeights.black,
  },
  tileLabel: {
    color:      textMuted,
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
  },
})

export default function FeesScreen() {
  const { activeChild } = useSession()

  const [data,       setData]      = useState(null)
  const [loading,    setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error,      setError]     = useState(null)

  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    entrance(fadeAnim, slideAnim).start()
  }, [])

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!activeChild?.student_id) {
      setLoading(false)
      setRefreshing(false)
      return
    }
    if (isRefresh) setRefreshing(true)
    else           setLoading(true)
    setError(null)
    try {
      const res = await parentGet(
        `/fees?student_id=${activeChild.student_id}&group_id=${activeChild.group_id}`
      )
      // res = { totals: { total, paid, pending, overdue }, fees: [...] }
      setData({
        totals: res.totals || { total: 0, paid: 0, pending: 0, overdue: 0 },
        fees:   res.fees   || [],
      })
    } catch (err) {
      console.warn('[Fees] API failed:', err.message)
      setError('Could not load fee data. Pull to refresh.')
      setData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeChild?.student_id, activeChild?.group_id])

  useEffect(() => {
    fetchData()
  }, [activeChild?.student_id])

  if (loading && !data) {
    return (
      <TabSafeScrollView showsVerticalScrollIndicator={false}>
        <SkeletonCard height={200} style={styles.section} />
        <SkeletonCard height={100} style={styles.section} />
        <SkeletonCard height={100} style={styles.section} />
        <SkeletonCard height={100} style={styles.section} />
      </TabSafeScrollView>
    )
  }

  if (error && !data) {
    return (
      <View style={styles.screen}>
        <ErrorState variant="apiError" message={error} onRetry={fetchData} />
      </View>
    )
  }

  const totals = data?.totals || {}
  const fees   = data?.fees   || data?.items || []

  return (
    <TabSafeScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={primary} colors={[primary]} />
      }
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* ── Header ── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Fees</Text>
          <Text style={styles.pageSubtitle}>Financial summary & payment history</Text>
        </View>

        {/* ── Financial Overview ── */}
        <View style={styles.section}>
          <FinancialOverview totals={totals} />
        </View>

        {/* ── Pay Button ── */}
        {totals?.pending > 0 || totals?.overdue > 0 ? (
          <View style={styles.section}>
            <AnimatedButton
              variant="primary"
              size="lg"
              onPress={() => Alert.alert(
                'Online Payment',
                'Payment gateway integration is coming soon. Please contact your school office for payment.',
                [{ text: 'OK' }]
              )}
              accessibilityLabel="Pay now"
            >
              Pay Fees Online 💳
            </AnimatedButton>
            <Text style={styles.payNote}>Secure payment — school authorized gateway</Text>
          </View>
        ) : null}

        {/* ── Fee Cards ── */}
        <View style={styles.section}>
          <SectionHeader title="Fee Details" subtitle={`${fees.length} item${fees.length !== 1 ? 's' : ''}`} />
          {fees.length > 0 ? (
            fees.map((fee, i) => (
              <FeeCard
                key={fee.id || i}
                fee={fee}
                style={i > 0 ? { marginTop: spacing.md } : null}
              />
            ))
          ) : (
            <EmptyState
              emoji="💳"
              title="No Fee Records"
              description="Your fee details will appear here when available."
            />
          )}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </Animated.View>
    </TabSafeScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: background,
  },
  scroll: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop:        spacing.xl,
  },
  section: {
    marginTop: layout.sectionGap,
  },
  pageHeader: {
    gap: 4,
  },
  pageTitle: {
    color:      textPrimary,
    fontSize:   fontSizes.h2,
    fontWeight: fontWeights.black,
  },
  pageSubtitle: {
    color:    textMuted,
    fontSize: fontSizes.sub,
  },
  payNote: {
    color:     textMuted,
    fontSize:  fontSizes.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})
