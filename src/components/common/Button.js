import React from 'react'
import { TouchableOpacity, StyleSheet, Text } from 'react-native'
import { primary, primaryInk, radius, success, textPrimary } from '../../theme/colors'

export default function Button({
  children,
  onPress,
  style,
  variant = 'primary', // primary | outline | success | danger | ghost
  disabled,
  accessibilityLabel,
}) {
  const stylesForVariant = (() => {
    switch (variant) {
      case 'outline':
        return { container: styles.outline, text: styles.outlineText }
      case 'success':
        return {
          container: { ...styles.outline, borderColor: success, backgroundColor: 'rgba(16,185,129,0.2)' },
          text: styles.outlineText,
        }
      case 'danger':
        return {
          container: { ...styles.outline, borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.2)' },
          text: styles.outlineText,
        }
      case 'ghost':
        return { container: styles.ghost, text: styles.outlineText }
      case 'primary':
      default:
        return { container: styles.primary, text: styles.primaryText }
    }
  })()

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.85}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.base,
        stylesForVariant.container,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Text style={[styles.text, stylesForVariant.text]}>{children}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
  primaryText: {
    color: primaryInk,
  },
  outlineText: {
    color: textPrimary,
  },
  primary: {
    backgroundColor: primary,
    borderColor: primary,
  },
  outline: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderColor: primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
})

