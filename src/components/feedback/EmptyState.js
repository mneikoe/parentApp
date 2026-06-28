/**
 * EmptyState — Premium empty state with animated entrance.
 * Every screen must use this instead of returning null/blank views.
 *
 * Usage:
 *   <EmptyState
 *     emoji="📚"
 *     title="No Homework"
 *     description="Your child has no pending assignments."
 *     ctaLabel="Refresh"
 *     onCta={reload}
 *   />
 */

import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { textPrimary, textSecondary, textMuted, spacing, radius } from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { entrance, durations } from '../../theme/motion';
import AnimatedButton from '../primitives/AnimatedButton';

const EmptyState = React.memo(function EmptyState({
  emoji       = '📭',
  title       = 'Nothing here yet',
  description,
  ctaLabel,
  onCta,
  secondaryCtaLabel,
  onSecondaryCta,
  style,
}) {
  const fadeVal  = useRef(new Animated.Value(0)).current;
  const slideVal = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    entrance(fadeVal, slideVal, 20, durations.normal).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeVal, transform: [{ translateY: slideVal }] },
        style,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {ctaLabel && onCta ? (
        <AnimatedButton
          variant="outline"
          size="sm"
          onPress={onCta}
          style={styles.cta}
        >
          {ctaLabel}
        </AnimatedButton>
      ) : null}
      {secondaryCtaLabel && onSecondaryCta ? (
        <AnimatedButton
          variant="ghost"
          size="sm"
          onPress={onSecondaryCta}
          style={styles.secondaryCta}
        >
          {secondaryCtaLabel}
        </AnimatedButton>
      ) : null}
    </Animated.View>
  );
});

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  emoji: {
    fontSize: 52,
    marginBottom: spacing.lg,
  },
  title: {
    color:       textPrimary,
    fontSize:    fontSizes.h4,
    fontWeight:  fontWeights.bold,
    textAlign:   'center',
    marginBottom: spacing.sm,
  },
  description: {
    color:       textSecondary,
    fontSize:    fontSizes.sub,
    textAlign:   'center',
    lineHeight:  22,
    marginBottom: spacing.xl,
  },
  cta: {
    minWidth: 140,
    marginBottom: spacing.sm,
  },
  secondaryCta: {
    minWidth: 140,
  },
});
