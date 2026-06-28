/**
 * SkeletonCard — Animated shimmer placeholder card.
 * Replaces ActivityIndicator for all loading states.
 * Usage: <SkeletonCard height={80} style={...} />
 *        <SkeletonCard lines={3} />
 */

import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { surface, card, border, radius, spacing } from '../../theme/colors';
import { shimmer } from '../../theme/motion';

const SkeletonLine = React.memo(function SkeletonLine({ shimAnim, width = '100%', height = 14, style }) {
  const opacity = shimAnim.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [0.30, 0.55, 0.30],
  });

  return (
    <Animated.View
      style={[
        styles.line,
        { width, height, opacity },
        style,
      ]}
    />
  );
});

const SkeletonCard = React.memo(function SkeletonCard({
  height,
  lines,
  style,
  padding = true,
}) {
  const shimAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = shimmer(shimAnim);
    anim.start();
    return () => anim.stop();
  }, [shimAnim]);

  if (height) {
    // Single-block skeleton
    const blockOpacity = shimAnim.interpolate({
      inputRange:  [0, 0.5, 1],
      outputRange: [0.28, 0.50, 0.28],
    });
    return (
      <Animated.View
        style={[
          styles.block,
          { height, opacity: blockOpacity },
          style,
        ]}
      />
    );
  }

  // Multi-line skeleton
  const lineHeights = [18, '75%', '55%', '85%', '60%', '40%'];

  return (
    <View style={[styles.card, padding && styles.cardPad, style]}>
      {Array.from({ length: lines || 3 }).map((_, i) => (
        <SkeletonLine
          key={i}
          shimAnim={shimAnim}
          width={lineHeights[i % lineHeights.length]}
          height={i === 0 ? 18 : 13}
          style={{ marginBottom: i < (lines || 3) - 1 ? spacing.sm : 0 }}
        />
      ))}
    </View>
  );
});

export default SkeletonCard;

const styles = StyleSheet.create({
  block: {
    backgroundColor: surface,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     border,
  },
  card: {
    backgroundColor: surface,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     border,
  },
  cardPad: {
    padding: spacing.lg,
  },
  line: {
    backgroundColor: card,
    borderRadius:    radius.sm,
  },
});
