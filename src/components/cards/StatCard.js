/**
 * StatCard — Compact metric card for dashboard summary row.
 * Shows: icon + label + value + optional trend badge.
 *
 * Usage:
 *   <StatCard icon="📚" label="Attendance" value="92%" trend="up" trendValue="+2%" />
 */

import React, { useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  card, border, primary, primaryLight,
  success, successLight,
  warning, warningLight,
  danger, dangerLight,
  textPrimary, textSecondary, textMuted,
  radius, spacing,
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { fadeIn, durations } from '../../theme/motion';
import { shadows } from '../../theme/shadows';

const TREND_COLORS = {
  up:      { color: success,  bg: successLight },
  down:    { color: danger,   bg: dangerLight  },
  neutral: { color: textMuted, bg: 'transparent' },
};

const StatCard = React.memo(function StatCard({
  icon,
  label,
  value,
  trend,
  trendValue,
  onPress,
  style,
  accentColor,
}) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tc = TREND_COLORS[trend] || TREND_COLORS.neutral;

  useEffect(() => {
    fadeIn(fadeAnim, durations.normal).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, shadows.sm, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, tension: 200, friction: 20, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1,    tension: 80,  friction: 8,  useNativeDriver: true }).start()}
        disabled={!onPress}
      >
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }] },
            accentColor && { borderColor: accentColor + '40' },
          ]}
        >
          {icon ? (
            <Text style={styles.icon}>{icon}</Text>
          ) : null}
          <Text
            style={[styles.value, accentColor && { color: accentColor }]}
            numberOfLines={1}
          >
            {value ?? '—'}
          </Text>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
          {trend && trendValue ? (
            <View style={[styles.trend, { backgroundColor: tc.bg }]}>
              <Text style={[styles.trendText, { color: tc.color }]}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
              </Text>
            </View>
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

export default StatCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: card,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.md,
    alignItems:      'center',
    minWidth:        90,
    flex:            1,
  },
  icon: {
    fontSize:     24,
    marginBottom: spacing.xs,
  },
  value: {
    color:       primary,
    fontSize:    fontSizes.h3,
    fontWeight:  fontWeights.black,
    marginBottom: 2,
  },
  label: {
    color:      textMuted,
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
    textAlign:  'center',
    textTransform: 'uppercase',
    letterSpacing:  0.5,
  },
  trend: {
    marginTop:     spacing.xs,
    borderRadius:  radius.round,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  trendText: {
    fontSize:   fontSizes.caption - 1,
    fontWeight: fontWeights.bold,
  },
});
