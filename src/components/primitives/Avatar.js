/**
 * Avatar — User / child avatar component.
 * Shows image (future) or initial letter with colored ring.
 * Sizes: xs | sm | md | lg | xl
 * Ring variants: none | online | offline | warning
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  card, primary, primaryLight, success, warning, danger,
  textPrimary, border, radius,
} from '../../theme/colors';
import { fontWeights } from '../../theme/typography';

const SIZES = {
  xs: { outer: 28, font: 11 },
  sm: { outer: 36, font: 14 },
  md: { outer: 48, font: 18 },
  lg: { outer: 60, font: 22 },
  xl: { outer: 80, font: 30 },
};

const RING_COLORS = {
  none:    'transparent',
  active:  primary,
  online:  success,
  offline: 'rgba(255,255,255,0.20)',
  warning: warning,
  danger:  danger,
};

// Generate consistent color from a string
const stringToColor = (str = '') => {
  const colors = [
    '#FF6A00', '#00C853', '#00F0FF', '#9B59B6',
    '#FFC107', '#3498DB', '#E74C3C', '#27AE60',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = React.memo(function Avatar({
  name      = '',
  size      = 'md',
  ring      = 'none',
  style,
  accessibilityLabel,
}) {
  const s    = SIZES[size] || SIZES.md;
  const initials = name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  const bgColor   = stringToColor(name);
  const ringColor = RING_COLORS[ring] || RING_COLORS.none;
  const ringWidth = ring !== 'none' ? 2.5 : 0;

  return (
    <View
      style={[
        styles.outer,
        {
          width:       s.outer,
          height:      s.outer,
          borderRadius: s.outer / 2,
          borderWidth:  ringWidth,
          borderColor:  ringColor,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel || name}
      accessibilityRole="image"
    >
      <View
        style={[
          styles.inner,
          {
            width:           s.outer - ringWidth * 2,
            height:          s.outer - ringWidth * 2,
            borderRadius:    (s.outer - ringWidth * 2) / 2,
            backgroundColor: bgColor + '33',   // 20% opacity tint
            borderWidth:     1,
            borderColor:     bgColor + '44',
          },
        ]}
      >
        <Text
          style={[styles.initials, { fontSize: s.font, color: bgColor }]}
          numberOfLines={1}
        >
          {initials || '?'}
        </Text>
      </View>
    </View>
  );
});

export default Avatar;

const styles = StyleSheet.create({
  outer: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: fontWeights.black,
  },
});
