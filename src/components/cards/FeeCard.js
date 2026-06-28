/**
 * FeeCard — Premium fee/payment card component.
 * Shows amount, due date, status pill, and partial progress bar.
 *
 * Usage:
 *   <FeeCard fee={feeItem} onPress={openFeeDetail} />
 */

import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, Pressable, StyleSheet } from 'react-native';
import {
  card, border, borderAccent,
  primary, primaryLight,
  success, successLight,
  warning, warningLight,
  danger, dangerLight,
  textPrimary, textSecondary, textMuted,
  radius, spacing,
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { fadeIn, durations } from '../../theme/motion';
import { shadows } from '../../theme/shadows';

const STATUS_CONFIG = {
  PAID:     { label: 'Paid',     color: success, bg: successLight, borderC: success + '40' },
  PENDING:  { label: 'Pending',  color: warning, bg: warningLight, borderC: warning + '40' },
  OVERDUE:  { label: 'Overdue',  color: danger,  bg: dangerLight,  borderC: danger  + '40' },
  PARTIAL:  { label: 'Partial',  color: primary, bg: primaryLight,  borderC: primary + '40' },
};

const ProgressBar = ({ paid, total }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pct = total > 0 ? Math.min(1, paid / total) : 0;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barColor = pct >= 1 ? success : pct >= 0.5 ? primary : warning;

  return (
    <View style={progStyles.track}>
      <Animated.View
        style={[
          progStyles.fill,
          {
            backgroundColor: barColor,
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

const progStyles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});

const FeeCard = React.memo(function FeeCard({ fee, onPress, style }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = React.useState(false);

  useEffect(() => {
    fadeIn(fadeAnim, durations.normal).start();
  }, []);

  const status  = fee?.status || 'PENDING';
  const sc      = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const paidAmt = fee?.paidAmount  || 0;
  const total   = fee?.totalAmount || fee?.amount || 0;
  const due     = fee?.dueDate
    ? new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const handlePress = onPress || (() => {
    if (fee.items && fee.items.length > 0) {
      setExpanded(!expanded);
    }
  });

  const showExpandText = !onPress && fee.items && fee.items.length > 0;

  return (
    <Animated.View style={[{ opacity: fadeAnim }, shadows.sm, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={()  => Animated.spring(scaleAnim, { toValue: 0.98, tension: 200, friction: 20, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1,    tension: 80,  friction: 8,  useNativeDriver: true }).start()}
      >
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.topRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.feeName} numberOfLines={1}>
                {fee?.feeName || fee?.name || 'Fee'}
              </Text>
              {fee?.termLabel ? (
                <Text style={styles.term} numberOfLines={1}>{fee.termLabel}</Text>
              ) : null}
            </View>
            <View style={[styles.statusPill, { backgroundColor: sc.bg, borderColor: sc.borderC }]}>
              <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amount}>
              ₹{Number(total).toLocaleString('en-IN')}
            </Text>
            {paidAmt > 0 && paidAmt < total ? (
              <Text style={styles.paid}>₹{Number(paidAmt).toLocaleString('en-IN')} paid</Text>
            ) : null}
          </View>

          {total > 0 && (status === 'PARTIAL' || paidAmt > 0) ? (
            <ProgressBar paid={paidAmt} total={total} />
          ) : null}

          {expanded && fee.items && fee.items.length > 0 && (
            <View style={styles.breakdown}>
              <View style={styles.divider} />
              <Text style={styles.breakdownTitle}>Fee Breakdown</Text>
              {fee.items.map((item, idx) => (
                <View key={idx} style={styles.breakdownRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemAmount}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
                </View>
              ))}
            </View>
          )}

          {due || showExpandText ? (
            <View style={styles.bottomRow}>
              {due ? (
                <Text style={styles.due}>Due: {due}</Text>
              ) : <View />}
              {showExpandText ? (
                <Text style={styles.expandToggle}>
                  {expanded ? 'Hide Breakdown ▲' : 'Show Breakdown ▼'}
                </Text>
              ) : null}
            </View>
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

export default FeeCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: card,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.lg,
  },
  topRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    gap:            spacing.sm,
  },
  titleWrap: { flex: 1 },
  feeName: {
    color:      textPrimary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  term: {
    color:    textMuted,
    fontSize: fontSizes.caption,
    marginTop: 2,
  },
  statusPill: {
    borderRadius:      radius.round,
    borderWidth:       1,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
  },
  statusText: {
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.extrabold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:           spacing.sm,
    marginTop:     spacing.md,
  },
  amount: {
    color:      textPrimary,
    fontSize:   fontSizes.h3,
    fontWeight: fontWeights.black,
  },
  paid: {
    color:    textMuted,
    fontSize: fontSizes.sub,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  due: {
    color:     textMuted,
    fontSize:  fontSizes.caption,
  },
  expandToggle: {
    color: primary,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.bold,
  },
  breakdown: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: border,
    marginBottom: spacing.xs,
  },
  breakdownTitle: {
    color: textSecondary,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: textSecondary,
    fontSize: fontSizes.sub,
  },
  itemAmount: {
    color: textPrimary,
    fontSize: fontSizes.sub,
    fontWeight: fontWeights.bold,
  },
});
