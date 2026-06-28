/**
 * PremiumCard — Core card primitive for STRAX Parent App.
 * Variants: default | elevated | glass | accent | success | danger
 * Animated press scale on pressable variant.
 */

import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import {
  background, border, borderAccent, borderSuccess, borderDanger,
  card, cardElevated, glass, primaryLight, primaryGlow,
  successLight, dangerLight, radius, spacing,
} from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { cardPressIn, cardPressOut } from '../../theme/motion';

const variantStyles = {
  default: {
    bg:     card,
    border: border,
    shadow: shadows.sm,
  },
  elevated: {
    bg:     cardElevated,
    border: border,
    shadow: shadows.md,
  },
  glass: {
    bg:     glass,
    border: 'rgba(255,255,255,0.10)',
    shadow: shadows.lg,
  },
  accent: {
    bg:     primaryLight,
    border: borderAccent,
    shadow: shadows.glow,
  },
  success: {
    bg:     successLight,
    border: borderSuccess,
    shadow: shadows.sm,
  },
  danger: {
    bg:     dangerLight,
    border: borderDanger,
    shadow: shadows.sm,
  },
};

const PremiumCard = React.memo(function PremiumCard({
  children,
  variant   = 'default',
  onPress,
  style,
  contentStyle,
  padding   = true,
  disabled  = false,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const v = variantStyles[variant] || variantStyles.default;

  const handlePressIn  = useCallback(() => { cardPressIn(scaleAnim).start(); }, [scaleAnim]);
  const handlePressOut = useCallback(() => { cardPressOut(scaleAnim).start(); }, [scaleAnim]);

  const cardStyle = [
    styles.base,
    { backgroundColor: v.bg, borderColor: v.border },
    v.shadow,
    padding && styles.padding,
    style,
    disabled && styles.disabled,
  ];

  if (onPress && !disabled) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={cardStyle}
          accessibilityRole="button"
        >
          <View style={contentStyle}>{children}</View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
});

export default PremiumCard;

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    borderWidth:  1,
    overflow:     'hidden',
  },
  padding: {
    padding: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});
