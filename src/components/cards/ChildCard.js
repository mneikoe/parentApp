/**
 * ChildCard — Selectable child profile card for multi-child switcher.
 * Animated active glow border and scale on selection.
 *
 * Usage:
 *   <ChildCard child={child} isActive onPress={select} />
 */

import React, { useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  card, cardElevated, border, borderAccent, primary, primaryLight,
  textPrimary, textSecondary, textMuted, radius, spacing,
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { durations, easings } from '../../theme/motion';
import Avatar from '../primitives/Avatar';

const ChildCard = React.memo(function ChildCard({
  child,
  isActive  = false,
  onPress,
  style,
}) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.02 : 1,
        tension: 180, friction: 12, useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue:  isActive ? 1 : 0,
        duration: durations.normal,
        easing:   easings.standard,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isActive]);

  const borderColor = glowAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [border, primary],
  });
  const bgColor = glowAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [card, 'rgba(255,106,0,0.06)'],
  });

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        isActive && shadows.glow,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(pressScale, { toValue: 0.97, tension: 200, friction: 20, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1,    tension: 80,  friction: 8,  useNativeDriver: true }).start()}
        accessibilityRole="button"
        accessibilityLabel={`Select ${child?.name}`}
        accessibilityState={{ selected: isActive }}
      >
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: bgColor, borderColor },
          ]}
        >
          <Avatar
            name={child?.name || '?'}
            size="md"
            ring={isActive ? 'active' : 'offline'}
          />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{child?.name || 'Unknown'}</Text>
            <Text style={styles.meta} numberOfLines={1}>
              {[child?.class, child?.section].filter(Boolean).join(' • ')}
            </Text>
            {child?.rollNumber ? (
              <Text style={styles.roll}>#{child.rollNumber}</Text>
            ) : null}
          </View>
          {isActive ? (
            <View style={styles.activeIndicator} />
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

export default ChildCard;

const styles = StyleSheet.create({
  card: {
    width:         140,
    borderRadius:  radius.xl,
    borderWidth:   1.5,
    padding:       spacing.md,
    alignItems:    'center',
    gap:           spacing.sm,
  },
  info: {
    alignItems: 'center',
    width:      '100%',
  },
  name: {
    color:      textPrimary,
    fontSize:   fontSizes.sub,
    fontWeight: fontWeights.bold,
    textAlign:  'center',
  },
  meta: {
    color:     textSecondary,
    fontSize:  fontSizes.caption,
    textAlign: 'center',
    marginTop: 2,
  },
  roll: {
    color:     primary,
    fontSize:  fontSizes.caption,
    fontWeight: fontWeights.bold,
    marginTop: 2,
  },
  activeIndicator: {
    width:         6,
    height:        6,
    borderRadius:  3,
    backgroundColor: primary,
  },
});
