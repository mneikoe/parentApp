/**
 * OTPBoxes — Premium 6-box OTP input component.
 * Uses a single hidden native TextInput with 6 styled visual boxes on top.
 * Animated active-box glow. Success state spring pulse.
 *
 * Usage:
 *   <OTPBoxes
 *     value={otp}
 *     onChange={setOtp}
 *     length={6}
 *     success={otpVerified}
 *     error={hasError}
 *   />
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Animated,
} from 'react-native';
import {
  surface, card, border, borderAccent, borderSuccess, borderDanger,
  primary, success, danger, textPrimary, radius, spacing,
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { pulse, durations, easings } from '../../theme/motion';

const BOX_SIZE   = 52;
const BOX_GAP    = 10;

const OTPBoxes = React.memo(function OTPBoxes({
  value    = '',
  onChange,
  length   = 6,
  success: isSuccess = false,
  error:   hasError  = false,
  disabled = false,
  autoFocus = true,
}) {
  const inputRef  = useRef(null);
  const scaleAnims = useRef(
    Array.from({ length }, () => new Animated.Value(1))
  ).current;
  const glowAnims = useRef(
    Array.from({ length }, () => new Animated.Value(0))
  ).current;

  // Focus the hidden input when component mounts
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  // Animate active box when value changes
  useEffect(() => {
    const activeIndex = Math.min(value.length, length - 1);
    glowAnims.forEach((a, i) => {
      Animated.timing(a, {
        toValue:  i === activeIndex && value.length < length ? 1 : 0,
        duration: durations.fast,
        easing:   easings.standard,
        useNativeDriver: true,
      }).start();
    });
  }, [value.length]);

  // Success: pulse all boxes
  useEffect(() => {
    if (isSuccess) {
      const pulseAnims = scaleAnims.map((a, i) =>
        Animated.sequence([
          Animated.delay(i * 40),
          Animated.spring(a, { toValue: 1.12, tension: 200, friction: 10, useNativeDriver: true }),
          Animated.spring(a, { toValue: 1.0,  tension: 80,  friction: 8,  useNativeDriver: true }),
        ])
      );
      Animated.stagger(40, pulseAnims).start();
    }
  }, [isSuccess]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const getBoxBorder = (index) => {
    if (isSuccess)     return borderSuccess;
    if (hasError)      return borderDanger;
    if (index === value.length && value.length < length) return borderAccent;
    if (index < value.length) return borderAccent;
    return border;
  };

  const getBoxBg = (index) => {
    if (isSuccess)   return 'rgba(0,200,83,0.12)';
    if (hasError)    return 'rgba(255,82,82,0.10)';
    if (index < value.length) return 'rgba(255,106,0,0.08)';
    return surface;
  };

  return (
    <Pressable onPress={focusInput} style={styles.wrapper}>
      {/* Hidden input captures keyboard */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, length);
          onChange?.(digits);
        }}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={length}
        caretHidden
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        editable={!disabled && !isSuccess}
        importantForAccessibility="no"
      />

      {/* Visual OTP boxes */}
      <View style={styles.boxes}>
        {Array.from({ length }).map((_, index) => {
          const char = value[index] || '';
          const isActive = index === value.length && value.length < length;
          const glowOpacity = glowAnims[index];

          return (
            <Animated.View
              key={index}
              style={[
                styles.box,
                {
                  backgroundColor: getBoxBg(index),
                  borderColor:     getBoxBorder(index),
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              {/* Active glow ring */}
              <Animated.View
                style={[
                  styles.glowRing,
                  { opacity: glowOpacity },
                ]}
              />

              <Text style={[
                styles.digit,
                isSuccess && { color: success },
                hasError  && { color: danger  },
              ]}>
                {char}
              </Text>

              {/* Cursor blink when active and no char */}
              {isActive && !char ? (
                <View style={styles.cursor} />
              ) : null}
            </Animated.View>
          );
        })}
      </View>
    </Pressable>
  );
});

export default OTPBoxes;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  hiddenInput: {
    position:   'absolute',
    width:      1,
    height:     1,
    opacity:    0,
    top:        -100,
    left:       -100,
    color:      'transparent',
  },
  boxes: {
    flexDirection: 'row',
    gap:           BOX_GAP,
  },
  box: {
    width:          BOX_SIZE,
    height:         BOX_SIZE,
    borderRadius:   radius.md,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    overflow:       'hidden',
  },
  glowRing: {
    position:      'absolute',
    inset:         0,
    borderRadius:  radius.md,
    backgroundColor: 'rgba(255,106,0,0.12)',
    borderWidth:    1.5,
    borderColor:    primary,
  },
  digit: {
    color:       textPrimary,
    fontSize:    fontSizes.h3,
    fontWeight:  fontWeights.black,
    zIndex:      1,
  },
  cursor: {
    width:           2,
    height:          24,
    backgroundColor: primary,
    borderRadius:    1,
    zIndex:          1,
  },
});
