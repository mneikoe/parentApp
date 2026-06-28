/**
 * ErrorState — Beautiful error screens for network/API/session errors.
 * Variants: offline | apiError | sessionExpired | permissionDenied | generic
 *
 * Usage:
 *   <ErrorState variant="offline" onRetry={reload} />
 *   <ErrorState variant="apiError" message={err.message} onRetry={reload} />
 */

import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import {
  textPrimary, textSecondary, danger, dangerLight, warning, warningLight,
  spacing, radius,
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { entrance, durations } from '../../theme/motion';
import AnimatedButton from '../primitives/AnimatedButton';

const VARIANT_MAP = {
  offline: {
    emoji:       '📡',
    title:       'No Internet',
    description: 'Check your connection and try again.',
  },
  apiError: {
    emoji:       '⚠️',
    title:       'Something Went Wrong',
    description: 'We couldn\'t load this page. Please retry.',
  },
  sessionExpired: {
    emoji:       '🔒',
    title:       'Session Expired',
    description: 'Please log in again to continue.',
  },
  permissionDenied: {
    emoji:       '🚫',
    title:       'Access Denied',
    description: 'You don\'t have permission to view this.',
  },
  generic: {
    emoji:       '🌀',
    title:       'Oops!',
    description: 'An unexpected error occurred.',
  },
};

const ErrorState = React.memo(function ErrorState({
  variant     = 'generic',
  message,
  onRetry,
  retryLabel  = 'Try Again',
  onSecondary,
  secondaryLabel,
  style,
}) {
  const fadeVal  = useRef(new Animated.Value(0)).current;
  const slideVal = useRef(new Animated.Value(20)).current;
  const v = VARIANT_MAP[variant] || VARIANT_MAP.generic;

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
      <Text style={styles.emoji}>{v.emoji}</Text>
      <Text style={styles.title}>{v.title}</Text>
      <Text style={styles.description}>
        {message || v.description}
      </Text>
      {onRetry ? (
        <AnimatedButton
          variant="outline"
          size="md"
          onPress={onRetry}
          style={styles.retryBtn}
        >
          {retryLabel}
        </AnimatedButton>
      ) : null}
      {onSecondary && secondaryLabel ? (
        <AnimatedButton
          variant="ghost"
          size="sm"
          onPress={onSecondary}
          style={styles.secondaryBtn}
        >
          {secondaryLabel}
        </AnimatedButton>
      ) : null}
    </Animated.View>
  );
});

export default ErrorState;

const styles = StyleSheet.create({
  container: {
    flex:             1,
    alignItems:       'center',
    justifyContent:   'center',
    paddingVertical:  spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  emoji: {
    fontSize:    52,
    marginBottom: spacing.lg,
  },
  title: {
    color:       textPrimary,
    fontSize:    fontSizes.h3,
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
  retryBtn: {
    minWidth:    160,
    marginBottom: spacing.sm,
  },
  secondaryBtn: {
    minWidth: 160,
  },
});
