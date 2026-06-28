/**
 * STRAX Mobile Design System — Motion Tokens
 * All animation durations, easings, and helpers live here.
 * Screens must never define raw timing values — use these presets.
 */

import { Animated, Easing } from 'react-native';

// ─── Durations (ms) ───────────────────────────────────────────
export const durations = {
  instant:   80,
  fast:      160,
  normal:    260,
  slow:      400,
  dramatic:  650,
};

// ─── Easing Curves ────────────────────────────────────────────
export const easings = {
  standard:    Easing.bezier(0.4, 0, 0.2, 1),   // Material standard
  decelerate:  Easing.bezier(0, 0, 0.2, 1),     // Entering elements
  accelerate:  Easing.bezier(0.4, 0, 1, 1),     // Leaving elements
  sharp:       Easing.bezier(0.4, 0, 0.6, 1),   // Quick snaps
};

// ─── Spring Configs ───────────────────────────────────────────
export const springs = {
  gentle: {
    tension:  40,
    friction: 7,
    useNativeDriver: true,
  },
  bouncy: {
    tension:  80,
    friction: 5,
    useNativeDriver: true,
  },
  snappy: {
    tension:  200,
    friction: 20,
    useNativeDriver: true,
  },
};

// ─── Animation Factory Helpers ────────────────────────────────

/**
 * fadeIn(animVal, duration?) → Animated.CompositeAnimation
 */
export const fadeIn = (animVal, duration = durations.normal) =>
  Animated.timing(animVal, {
    toValue: 1,
    duration,
    easing: easings.decelerate,
    useNativeDriver: true,
  });

/**
 * fadeOut(animVal, duration?) → Animated.CompositeAnimation
 */
export const fadeOut = (animVal, duration = durations.fast) =>
  Animated.timing(animVal, {
    toValue: 0,
    duration,
    easing: easings.accelerate,
    useNativeDriver: true,
  });

/**
 * slideUp(animVal, from?, duration?) — translates Y from `from` to 0
 */
export const slideUp = (animVal, from = 24, duration = durations.normal) =>
  Animated.timing(animVal, {
    toValue: 0,
    duration,
    easing: easings.decelerate,
    useNativeDriver: true,
  });

/**
 * scaleIn(animVal, from?, springConfig?) → spring scale animation
 */
export const scaleIn = (animVal, from = 0.94, config = springs.gentle) =>
  Animated.spring(animVal, {
    toValue: 1,
    ...config,
  });

/**
 * cardPressIn(animVal) → quick scale down
 */
export const cardPressIn = (animVal) =>
  Animated.spring(animVal, {
    toValue: 0.97,
    ...springs.snappy,
  });

/**
 * cardPressOut(animVal) → spring back to 1
 */
export const cardPressOut = (animVal) =>
  Animated.spring(animVal, {
    toValue: 1,
    ...springs.bouncy,
  });

/**
 * pulse(animVal) → scale up slightly and back (for success states)
 */
export const pulse = (animVal) =>
  Animated.sequence([
    Animated.spring(animVal, { toValue: 1.08, ...springs.snappy }),
    Animated.spring(animVal, { toValue: 1.0, ...springs.gentle }),
  ]);

/**
 * shimmer(animVal) → infinite left-to-right shimmer loop
 */
export const shimmer = (animVal) =>
  Animated.loop(
    Animated.timing(animVal, {
      toValue: 1,
      duration: 1200,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );

/**
 * staggerChildren(animations, delay?) → staggered entrance
 */
export const staggerChildren = (animations, delay = 60) =>
  Animated.stagger(delay, animations);

/**
 * entrance(fadeVal, slideVal, from?) → combined fade + slide up entrance
 * Usage:
 *   const fade = useRef(new Animated.Value(0)).current
 *   const slide = useRef(new Animated.Value(24)).current
 *   entrance(fade, slide).start()
 *   style={{ opacity: fade, transform: [{ translateY: slide }] }}
 */
export const entrance = (fadeVal, slideVal, from = 24, duration = durations.normal) =>
  Animated.parallel([
    fadeIn(fadeVal, duration),
    slideUp(slideVal, from, duration),
  ]);
