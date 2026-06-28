/**
 * LoginScreen v2 — Premium S-TRAX Parent Login (Light Theme)
 * Keyboard-safe with ScrollView and dynamic background glow.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  KeyboardAvoidingView, Platform, StyleSheet,
  Text, View, Animated, TextInput, ScrollView,
} from 'react-native'
import {
  background, surface, border, borderAccent, card,
  primary, primaryLight, primaryGlow,
  secondary,
  textPrimary, textSecondary, textMuted,
  danger, dangerLight,
  radius, spacing, layout,
} from '../../theme/colors'
import { fontSizes, fontWeights, letterSpacing } from '../../theme/typography'
import { entrance, durations, easings } from '../../theme/motion'
import { publicPost } from '../../utils/api'
import { auditEvent } from '../../utils/audit'
import AnimatedButton from '../../components/primitives/AnimatedButton'

const COUNTRY_CODE = '+91'

export default function LoginScreen({ navigation }) {
  const [mobile, setMobile]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const heroFade  = useRef(new Animated.Value(0)).current
  const heroSlide = useRef(new Animated.Value(30)).current
  const cardFade  = useRef(new Animated.Value(0)).current
  const cardSlide = useRef(new Animated.Value(30)).current
  const shakeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: durations.slow,   easing: easings.decelerate, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: durations.slow,   easing: easings.decelerate, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade,  { toValue: 1, duration: durations.normal, easing: easings.decelerate, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: durations.normal, easing: easings.decelerate, useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start()
  }, [shakeAnim])

  const normalizedMobile = String(mobile || '').replace(/\D/g, '')
  const phone  = `${COUNTRY_CODE}${normalizedMobile}`
  const isValid = normalizedMobile.length >= 10

  const onGetOtp = useCallback(async () => {
    if (!isValid) { shake(); return }
    setLoading(true)
    setError('')
    try {
      const result = await publicPost('/auth/otp/request', { phone })
      auditEvent('LOGIN_OTP_SENT', { phone })
      navigation.navigate('OTP', {
        mobile:          normalizedMobile,
        phone,
        cooldownSeconds: result.cooldownSeconds || 60,
      })
    } catch (err) {
      const msg = err.message || 'Failed to send OTP. Please try again.'
      setError(msg)
      shake()
      auditEvent('LOGIN_OTP_ERROR', { phone, error: msg })
    } finally {
      setLoading(false)
    }
  }, [isValid, phone, normalizedMobile, shake, navigation])

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      {/* ── Background Glow ── */}
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* ── Hero / Brand ── */}
          <Animated.View
            style={[
              styles.hero,
              { opacity: heroFade, transform: [{ translateY: heroSlide }] },
            ]}
          >
            <View style={styles.logoBadge}>
              <View style={styles.logoGlow1} />
              <View style={styles.logoGlow2} />
              <Text style={styles.logoLetter}>S</Text>
            </View>
            <Text style={styles.brand}>STRAX</Text>
            <Text style={styles.brandTagline}>
              Your child's school, in your hands.
            </Text>
            <View style={styles.pillRow}>
              <View style={styles.pill}><Text style={styles.pillText}>🔒 Secure</Text></View>
              <View style={styles.pill}><Text style={styles.pillText}>📱 WhatsApp OTP</Text></View>
              <View style={styles.pill}><Text style={styles.pillText}>⚡ Instant</Text></View>
            </View>
          </Animated.View>

          {/* ── Login Card ── */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity:  cardFade,
                transform: [
                  { translateY: cardSlide },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardHint}>Enter your registered mobile number</Text>

            {/* Mobile Input */}
            <View style={styles.inputLabel}>
              <Text style={styles.label}>MOBILE NUMBER</Text>
            </View>
            <View style={styles.mobileRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryText}>🇮🇳 {COUNTRY_CODE}</Text>
              </View>
              <View style={[styles.inputBox, mobile.length > 0 && styles.inputBoxActive]}>
                <TextInput
                  value={mobile}
                  onChangeText={(v) => { setMobile(v); setError('') }}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                  selectionColor={primary}
                  autoFocus={false}
                />
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️  {error}</Text>
              </View>
            ) : null}

            {/* CTA */}
            <AnimatedButton
              variant="primary"
              size="lg"
              onPress={onGetOtp}
              loading={loading}
              disabled={!isValid}
              style={styles.cta}
              accessibilityLabel="Get OTP via WhatsApp"
            >
              Get OTP via WhatsApp 💬
            </AnimatedButton>

            <Text style={styles.hint}>
              We'll send a 6-digit OTP to this number on WhatsApp
            </Text>
          </Animated.View>

          {/* ── Footer ── */}
          <Animated.View style={[styles.footer, { opacity: cardFade }]}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms & Privacy Policy</Text>
            </Text>
          </Animated.View>
        </View>
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
  // ── Background Glows ──
  bgGlow1: {
    position:        'absolute',
    width:           300,
    height:          300,
    borderRadius:    150,
    backgroundColor: 'rgba(255,106,0,0.06)',
    top:             -80,
    right:           -80,
  },
  bgGlow2: {
    position:        'absolute',
    width:           200,
    height:          200,
    borderRadius:    100,
    backgroundColor: 'rgba(0,240,255,0.04)',
    bottom:          100,
    left:            -60,
  },
  // ── Layout ──
  inner: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical:   spacing.xl,
    gap:               spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap:        spacing.sm,
  },
  logoBadge: {
    width:           80,
    height:          80,
    borderRadius:    40,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: primaryLight,
    borderWidth:     1.5,
    borderColor:     borderAccent,
    marginBottom:    spacing.sm,
    position:        'relative',
    overflow:        'hidden',
  },
  logoGlow1: {
    position:        'absolute',
    inset:           0,
    backgroundColor: primaryGlow,
    opacity:         0.25,
  },
  logoGlow2: {
    position:        'absolute',
    width:           60,
    height:          60,
    top:             10,
    left:            10,
    borderRadius:    30,
    backgroundColor: primary,
    opacity:         0.08,
  },
  logoLetter: {
    color:      primary,
    fontSize:   36,
    fontWeight: fontWeights.black,
    letterSpacing: -1,
    zIndex:     1,
  },
  brand: {
    color:         textPrimary,
    fontSize:      fontSizes.h1,
    fontWeight:    fontWeights.black,
    letterSpacing: letterSpacing.widest,
  },
  brandTagline: {
    color:         textSecondary,
    fontSize:      fontSizes.sub,
    fontWeight:    fontWeights.medium,
    textAlign:     'center',
    marginTop:     2,
  },
  pillRow: {
    flexDirection:  'row',
    gap:            spacing.xs,
    marginTop:      spacing.sm,
    flexWrap:       'wrap',
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: surface,
    borderRadius:    radius.round,
    borderWidth:     1,
    borderColor:     border,
    paddingHorizontal: spacing.sm,
    paddingVertical:  4,
  },
  pillText: {
    color:      textMuted,
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
  },
  // ── Card ──
  card: {
    backgroundColor: card,
    borderRadius:    radius.xxl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.xl,
    gap:             spacing.md,
  },
  cardTitle: {
    color:      textPrimary,
    fontSize:   fontSizes.h3,
    fontWeight: fontWeights.black,
  },
  cardHint: {
    color:     textMuted,
    fontSize:  fontSizes.sub,
    marginTop: -spacing.xs,
  },
  // ── Input ──
  inputLabel: { marginTop: spacing.sm },
  label: {
    color:         textMuted,
    fontSize:      fontSizes.label,
    fontWeight:    fontWeights.black,
    letterSpacing: letterSpacing.label,
    marginBottom:  spacing.sm,
  },
  mobileRow: {
    flexDirection:  'row',
    gap:            spacing.sm,
    alignItems:     'center',
  },
  countryCode: {
    backgroundColor: surface,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     border,
    paddingHorizontal: spacing.md,
    paddingVertical:   14,
    justifyContent:   'center',
  },
  countryText: {
    color:      textPrimary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  inputBox: {
    flex:            1,
    backgroundColor: surface,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     border,
    paddingHorizontal: spacing.md,
    justifyContent:  'center',
  },
  inputBoxActive: {
    borderColor: borderAccent,
    backgroundColor: 'rgba(255,106,0,0.04)',
  },
  input: {
    color:      textPrimary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.medium,
    paddingVertical: 14,
  },
  errorBox: {
    backgroundColor: dangerLight,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     'rgba(255,82,82,0.35)',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
  },
  errorText: {
    color:      '#FFADAD',
    fontSize:   fontSizes.sub,
    fontWeight: fontWeights.bold,
  },
  cta: { marginTop: spacing.xs },
  hint: {
    color:     textMuted,
    fontSize:  fontSizes.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color:     textMuted,
    fontSize:  fontSizes.caption,
    textAlign: 'center',
  },
  footerLink: {
    color: secondary,
  },
})
