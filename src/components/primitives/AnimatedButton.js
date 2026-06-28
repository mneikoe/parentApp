/**
 * AnimatedButton — Premium button component for STRAX Parent App.
 * Variants: primary | secondary | ghost | danger | outline
 * Spring scale-down on press. Loading and disabled states.
 */

import React, { useRef, useCallback } from 'react';
import {
  Animated, Pressable, StyleSheet, Text, View, ActivityIndicator,
} from 'react-native';
import {
  primary, primaryLight, primaryGlow, primaryInk,
  secondary, secondaryLight,
  danger, dangerLight,
  textPrimary, textMuted,
  border, borderAccent,
  radius, spacing,
  opacity as opacityTokens,
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { cardPressIn, cardPressOut } from '../../theme/motion';

const VARIANTS = {
  primary: {
    bg:         primary,
    text:       primaryInk,
    border:     'transparent',
    loadingColor: primaryInk,
  },
  secondary: {
    bg:         secondaryLight,
    text:       secondary,
    border:     secondary,
    loadingColor: secondary,
  },
  ghost: {
    bg:         'transparent',
    text:       textPrimary,
    border:     border,
    loadingColor: textPrimary,
  },
  outline: {
    bg:         'transparent',
    text:       primary,
    border:     borderAccent,
    loadingColor: primary,
  },
  danger: {
    bg:         dangerLight,
    text:       danger,
    border:     danger,
    loadingColor: danger,
  },
};

const SIZES = {
  sm: { height: 38, paddingH: 14, fontSize: fontSizes.sub },
  md: { height: 50, paddingH: 20, fontSize: fontSizes.body },
  lg: { height: 58, paddingH: 24, fontSize: fontSizes.h4 },
};

const AnimatedButton = React.memo(function AnimatedButton({
  children,
  variant    = 'primary',
  size       = 'md',
  onPress,
  disabled   = false,
  loading    = false,
  style,
  textStyle,
  icon,
  iconRight,
  fullWidth  = true,
  accessibilityLabel,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  const handlePressIn  = useCallback(() => { if (!isDisabled) cardPressIn(scaleAnim).start(); }, [isDisabled, scaleAnim]);
  const handlePressOut = useCallback(() => { if (!isDisabled) cardPressOut(scaleAnim).start(); }, [isDisabled, scaleAnim]);

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPress={isDisabled ? null : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[
          styles.base,
          {
            height:          s.height,
            paddingHorizontal: s.paddingH,
            backgroundColor: v.bg,
            borderColor:     v.border,
            borderWidth:     v.border === 'transparent' ? 0 : 1,
          },
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={v.loadingColor} />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconLeft}>{icon}</View>}
            <Text
              style={[
                styles.label,
                { color: v.text, fontSize: s.fontSize },
                isDisabled && styles.labelDisabled,
                textStyle,
              ]}
              numberOfLines={1}
            >
              {children}
            </Text>
            {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

export default AnimatedButton;

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  base: {
    borderRadius:   radius.lg,
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'row',
  },
  content: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.sm,
  },
  label: {
    fontWeight:     fontWeights.bold,
    textAlign:      'center',
  },
  labelDisabled: {
    opacity: 0.5,
  },
  iconLeft:  { marginRight: spacing.xs },
  iconRight: { marginLeft: spacing.xs },
  disabled: {
    opacity: opacityTokens.disabled,
  },
});
