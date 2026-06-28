/**
 * OTPScreen v2 — Premium STRAX OTP Verification Screen
 * Uses OTPBoxes component. Animated success state.
 * Auto-submits at 6 digits. Countdown resend timer.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  KeyboardAvoidingView, Platform, StyleSheet,
  Text, View, Animated, Pressable, ScrollView,
} from 'react-native'
import {
  background, surface, border, borderAccent,
  primary, primaryLight, primaryGlow,
  success, successLight,
  textPrimary, textSecondary, textMuted,
  danger, dangerLight,
  radius, spacing, layout,
} from '../../theme/colors'
import { fontSizes, fontWeights, letterSpacing } from '../../theme/typography'
import { entrance, durations, easings, pulse } from '../../theme/motion'
import { publicPost } from '../../utils/api'
import { saveSession } from '../../utils/secureSession'
import { auditEvent } from '../../utils/audit'
import OTPBoxes from '../../components/inputs/OTPBoxes'
import AnimatedButton from '../../components/primitives/AnimatedButton'
import useOtpCountdown from '../../hooks/useOtpCountdown'

const OTP_LENGTH = 6

export default function OTPScreen({ navigation, route, onVerified }) {
  const { mobile, phone, cooldownSeconds = 60 } = route.params || {}

  const [otp,       setOtp]       = useState('')
  const [loading,   setLoading]   = useState(false)
  const [verified,  setVerified]  = useState(false)
  const [error,     setError]     = useState('')
  const [resending, setResending] = useState(false)

  const { secondsLeft: countdown, restart: resetCountdown } = useOtpCountdown(cooldownSeconds)
  const canResend = countdown === 0

  // Entrance
  const fade  = useRef(new Animated.Value(0)).current
  const slide = useRef(new Animated.Value(24)).current
  // Success checkmark scale
  const checkScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    entrance(fade, slide).start()
  }, [])

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.length === OTP_LENGTH && !loading && !verified) {
      verifyOtp(otp)
    }
  }, [otp])

  const verifyOtp = useCallback(async (otpValue) => {
    if (!otpValue || otpValue.length < OTP_LENGTH) return
    setLoading(true)
    setError('')
    try {
      const result = await publicPost('/auth/otp/verify', { phone, code: otpValue })

      // Backend returns: { token, refresh_token, roles, user: { user_id, phone, email, email_verified, name, full_name }, linked_children }
      const userInfo = result.user || {}
      const newSession = {
        token:          result.token || result.sessionToken,
        refresh_token:  result.refresh_token,
        phone:          userInfo.phone || phone,
        email:          userInfo.email || null,
        email_verified: !!userInfo.email_verified,
        name:           userInfo.name || userInfo.full_name || null,
        full_name:      userInfo.full_name || userInfo.name || null,
        roles:          result.roles || [],
        linked_children: result.linked_children || 0,
        // children fetched fresh by dashboard — don't cache stale data here
        children:       [],
      }
      await saveSession(newSession)
      auditEvent('OTP_VERIFIED', { phone })
      setVerified(true)
      // Animate success checkmark
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }).start()
      // Navigate after brief success display
      setTimeout(() => {
        onVerified?.(newSession)
      }, 1200)
    } catch (err) {
      const msg = err.message || 'Invalid OTP. Please try again.'
      setError(msg)
      setOtp('')
      auditEvent('OTP_FAILED', { phone, error: msg })
    } finally {
      setLoading(false)
    }
  }, [phone, checkScale, onVerified])

  const handleResend = useCallback(async () => {
    if (!canResend || resending) return
    setResending(true)
    setError('')
    setOtp('')
    try {
      await publicPost('/auth/otp/request', { phone })
      resetCountdown()
      auditEvent('OTP_RESENT', { phone })
    } catch (err) {
      setError('Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }, [canResend, resending, phone, resetCountdown])

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      {/* ── Background Glow ── */}
      <View style={styles.bgGlow} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.inner,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          {/* ── Back Button ── */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <View style={styles.iconGlow} />
              <Text style={styles.icon}>💬</Text>
            </View>
            <Text style={styles.title}>Check WhatsApp</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.phone}>+91 {mobile}</Text>
            </Text>
          </View>

          {/* ── OTP Boxes ── */}
          <View style={styles.otpSection}>
            {!verified ? (
              <>
                <OTPBoxes
                  value={otp}
                  onChange={(v) => { setOtp(v); setError('') }}
                  length={OTP_LENGTH}
                  error={!!error}
                  disabled={loading}
                  autoFocus
                />

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️  {error}</Text>
                  </View>
                ) : null}

                {/* Manual submit */}
                <AnimatedButton
                  variant="primary"
                  size="lg"
                  onPress={() => verifyOtp(otp)}
                  loading={loading}
                  disabled={otp.length < OTP_LENGTH}
                  style={styles.submitBtn}
                >
                  Verify OTP
                </AnimatedButton>

                {/* Resend */}
                <View style={styles.resendRow}>
                  {canResend ? (
                    <Pressable onPress={handleResend} disabled={resending}>
                      <Text style={styles.resendActive}>
                        {resending ? 'Sending…' : 'Resend OTP'}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.resendTimer}>
                      Resend in{' '}
                      <Text style={{ color: primary }}>
                        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                      </Text>
                    </Text>
                  )}
                </View>
              </>
            ) : (
              /* ── Success State ── */
              <Animated.View
                style={[styles.successWrap, { transform: [{ scale: checkScale }] }]}
              >
                <View style={styles.successBadge}>
                  <Text style={styles.successCheck}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Verified!</Text>
                <Text style={styles.successSub}>Loading your dashboard…</Text>
              </Animated.View>
            )}
          </View>

          {/* ── Info ── */}
          {!verified ? (
            <Text style={styles.info}>
              Didn\'t get the message? Make sure +91 {mobile} is on WhatsApp.
            </Text>
          ) : null}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: background,
  },
  scroll: {
    flexGrow:        1,
    justifyContent:  'center',
  },
  bgGlow: {
    position:        'absolute',
    width:           280,
    height:          280,
    borderRadius:    140,
    backgroundColor: 'rgba(0,240,255,0.05)',
    top:             -60,
    left:            -60,
  },
  inner: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical:   spacing.xl,
    gap:               spacing.xl,
  },
  backBtn: {
    position: 'absolute',
    top:      spacing.xl,
    left:     layout.screenPaddingH,
  },
  backText: {
    color:      textSecondary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  // ── Header ──
  header: {
    alignItems: 'center',
    gap:        spacing.md,
    marginTop:  spacing.xxxl,
  },
  iconWrap: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: 'rgba(0,240,255,0.08)',
    borderWidth:     1.5,
    borderColor:     'rgba(0,240,255,0.25)',
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
    overflow:        'hidden',
  },
  iconGlow: {
    position:        'absolute',
    inset:           0,
    backgroundColor: 'rgba(0,240,255,0.10)',
    borderRadius:    40,
  },
  icon: { fontSize: 36 },
  title: {
    color:      textPrimary,
    fontSize:   fontSizes.h2,
    fontWeight: fontWeights.black,
  },
  subtitle: {
    color:     textSecondary,
    fontSize:  fontSizes.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  phone: {
    color:      primary,
    fontWeight: fontWeights.bold,
  },
  // ── OTP Section ──
  otpSection: {
    alignItems: 'center',
    gap:        spacing.xl,
  },
  errorBox: {
    backgroundColor: dangerLight,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     'rgba(255,82,82,0.35)',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    width:           '100%',
  },
  errorText: {
    color:      '#FFADAD',
    fontSize:   fontSizes.sub,
    fontWeight: fontWeights.bold,
    textAlign:  'center',
  },
  submitBtn: {
    width: '100%',
  },
  resendRow: {
    alignItems: 'center',
  },
  resendActive: {
    color:      primary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  resendTimer: {
    color:    textMuted,
    fontSize: fontSizes.sub,
  },
  // ── Success ──
  successWrap: {
    alignItems: 'center',
    gap:        spacing.md,
  },
  successBadge: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: successLight,
    borderWidth:     2,
    borderColor:     success + '60',
    alignItems:      'center',
    justifyContent:  'center',
  },
  successCheck: {
    color:      success,
    fontSize:   48,
    fontWeight: fontWeights.black,
  },
  successTitle: {
    color:      textPrimary,
    fontSize:   fontSizes.h2,
    fontWeight: fontWeights.black,
  },
  successSub: {
    color:    textMuted,
    fontSize: fontSizes.body,
  },
  info: {
    color:     textMuted,
    fontSize:  fontSizes.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
})
