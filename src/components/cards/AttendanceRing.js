/**
 * AttendanceRing — Circular progress bar using standard React Native Views.
 * Zero external library dependencies. Resolves "react-native-svg" import errors.
 */

import React, { useRef, useEffect } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'
import {
  surface, border, primary, success, warning, danger,
  textMuted, spacing,
} from '../../theme/colors'
import { fontSizes, fontWeights } from '../../theme/typography'

const getColor = (pct) => {
  if (pct >= 85) return success
  if (pct >= 70) return warning
  return danger
}

const RingHalf = ({ color, size, rotation, strokeWidth }) => {
  return (
    <View style={[styles.halfWrap, { width: size / 2, height: size }]}>
      <Animated.View
        style={[
          styles.halfCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [{ rotate: rotation }],
          },
        ]}
      />
    </View>
  )
}

const AttendanceRing = React.memo(function AttendanceRing({
  percentage = 0,
  size       = 100,
  strokeWidth = 8,
  style,
}) {
  const color = getColor(percentage)
  const cleanPct = Math.min(100, Math.max(0, percentage))

  // Rotate interpolations
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: cleanPct,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [cleanPct])

  // Split rotation math: 360 degrees total
  // First half rotates from -135deg to 45deg (represents 0% to 50%)
  const rotateLeft = anim.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['-135deg', '45deg', '45deg'],
  })

  // Second half rotates from -135deg to 45deg (represents 50% to 100%)
  const rotateRight = anim.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['-135deg', '-135deg', '45deg'],
  })

  return (
    <View style={[styles.wrapper, style, { width: size, height: size }]}>
      {/* Background Track Circle */}
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color + '15',
          },
        ]}
      />

      {/* Right Progress Half */}
      <View style={[styles.halfCircleContainer, { width: size / 2, height: size, left: size / 2 }]}>
        <RingHalf color={color} size={size} rotation={rotateRight} strokeWidth={strokeWidth} />
      </View>

      {/* Left Progress Half */}
      <View style={[styles.halfCircleContainer, { width: size / 2, height: size, left: 0, transform: [{ rotate: '180deg' }] }]}>
        <RingHalf color={color} size={size} rotation={rotateLeft} strokeWidth={strokeWidth} />
      </View>

      {/* Central Value */}
      <View style={[styles.center, { width: size - strokeWidth * 2, height: size - strokeWidth * 2, borderRadius: (size - strokeWidth * 2) / 2 }]}>
        <Text style={[styles.pct, { color }]}>{Math.round(cleanPct)}%</Text>
        <Text style={styles.present}>Attendance</Text>
      </View>
    </View>
  )
})

export default AttendanceRing

const styles = StyleSheet.create({
  wrapper: {
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },
  track: {
    position: 'absolute',
    top:      0,
    left:     0,
  },
  halfCircleContainer: {
    position: 'absolute',
    top:      0,
    overflow: 'hidden',
  },
  halfWrap: {
    overflow: 'hidden',
  },
  halfCircle: {
    position: 'absolute',
    top:      0,
    left:     0,
  },
  center: {
    position:        'absolute',
    backgroundColor: surface,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     'rgba(0,0,0,0.03)',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   1,
    shadowRadius:    4,
    elevation:       2,
  },
  pct: {
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.black,
    lineHeight: 18,
  },
  present: {
    color:      textMuted,
    fontSize:   8,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop:  1,
  },
})
