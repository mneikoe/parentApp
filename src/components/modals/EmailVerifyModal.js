/**
 * EmailVerifyModal — Premium sliding modal for email entry and 6-digit OTP verification.
 * Keeps user context active but requires verification before accessing features if unverified.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Modal, StyleSheet, Text, View, TextInput, Animated, KeyboardAvoidingView,
  Platform, Pressable, ActivityIndicator, Alert,
} from 'react-native'
import {
  background, surface, border, borderAccent, card,
  primary, primaryLight, secondary, textPrimary, textSecondary, textMuted,
  radius, spacing, danger, dangerLight, success, successLight,
} from '../../theme/colors'
import { fontSizes, fontWeights, letterSpacing } from '../../theme/typography'
import { shadows } from '../../theme/shadows'
import AnimatedButton from '../primitives/AnimatedButton'
import { parentPost } from '../../utils/api'
import { saveSession } from '../../utils/secureSession'
import OTPBoxes from '../inputs/OTPBoxes'

export default function EmailVerifyModal({ session, setSession, visible }) {
  const [email, setEmail]             = useState('')
  const [code, setCode]               = useState('')
  const [step, setStep]               = useState(1) // 1 = input email, 2 = input code
  
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [successState, setSuccess]    = useState(false)

  const slideAnim = useRef(new Animated.Value(300)).current
  const checkScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Preset email if it is not a placeholder local email
      const currEmail = session?.email || ''
      if (currEmail && !currEmail.includes('.local')) {
        setEmail(currEmail)
      }
      
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start()
    } else {
      slideAnim.setValue(300)
      setStep(1)
      setCode('')
      setError('')
      setSuccess(false)
    }
  }, [visible, session, slideAnim])

  const handleRequestCode = useCallback(async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await parentPost('/auth/email/request', { email: email.trim().toLowerCase() })
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to send verification code.')
    } finally {
      setLoading(false)
    }
  }, [email])

  const handleVerifyCode = useCallback(async () => {
    if (code.length < 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await parentPost('/auth/email/verify', { code: code.trim() })
      
      // Save new email verification state locally
      const updatedSession = {
        ...session,
        email: email.trim().toLowerCase(),
        email_verified: true,
      }
      await saveSession(updatedSession)
      setSession(updatedSession)

      setSuccess(true)
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }).start()
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }, [code, email, session, setSession, checkScale])

  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Animated.View style={[styles.modalCard, shadows.xl, { transform: [{ translateY: slideAnim }] }]}>
            {!successState ? (
              <>
                <View style={styles.header}>
                  <Text style={styles.badgeEmoji}>✉️</Text>
                  <Text style={styles.title}>
                    {step === 1 ? 'Verify Email Address' : 'Enter Verification Code'}
                  </Text>
                  <Text style={styles.subtitle}>
                    {step === 1
                      ? 'Please link a verified email address to receive secure school reports & updates.'
                      : `We sent a 6-digit verification code to ${email}`}
                  </Text>
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️  {error}</Text>
                  </View>
                ) : null}

                {step === 1 ? (
                  /* Step 1: Input Email */
                  <View style={styles.form}>
                    <Text style={styles.label}>EMAIL ADDRESS</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        value={email}
                        onChangeText={(v) => { setEmail(v); setError('') }}
                        placeholder="e.g. parent@example.com"
                        placeholderTextColor={textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        selectionColor={primary}
                      />
                    </View>

                    <AnimatedButton
                      variant="primary"
                      size="lg"
                      onPress={handleRequestCode}
                      loading={loading}
                      style={styles.btn}
                      disabled={!email.includes('@')}
                    >
                      Send Verification Code
                    </AnimatedButton>
                  </View>
                ) : (
                  /* Step 2: Input OTP Code */
                  <View style={styles.form}>
                    <Text style={styles.label}>6-DIGIT CODE</Text>
                    <OTPBoxes
                      value={code}
                      onChange={(v) => { setCode(v); setError('') }}
                      length={6}
                      error={!!error}
                      disabled={loading}
                    />

                    <AnimatedButton
                      variant="primary"
                      size="lg"
                      onPress={handleVerifyCode}
                      loading={loading}
                      style={styles.btn}
                      disabled={code.length < 6}
                    >
                      Verify & Continue
                    </AnimatedButton>

                    <Pressable onPress={() => setStep(1)} style={styles.backLink}>
                      <Text style={styles.backLinkText}>Change email address</Text>
                    </Pressable>
                  </View>
                )}
              </>
            ) : (
              /* Success State */
              <Animated.View style={[styles.successContent, { transform: [{ scale: checkScale }] }]}>
                <View style={styles.successBadge}>
                  <Text style={styles.successCheck}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Email Linked!</Text>
                <Text style={styles.successSub}>Thank you. Your account is fully secured.</Text>
              </Animated.View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Premium low opacity backdrop
    justifyContent:  'flex-end',
  },
  container: {
    width: '100%',
  },
  modalCard: {
    backgroundColor: card,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.xl,
    gap:             spacing.lg,
    paddingBottom:   Platform.OS === 'ios' ? 44 : 24,
  },
  header: {
    alignItems: 'center',
    gap:        spacing.xs,
  },
  badgeEmoji: {
    fontSize:     42,
    marginBottom: spacing.xs,
  },
  title: {
    color:      textPrimary,
    fontSize:   fontSizes.h3,
    fontWeight: fontWeights.black,
  },
  subtitle: {
    color:      textSecondary,
    fontSize:   fontSizes.sub,
    textAlign:  'center',
    lineHeight: 18,
  },
  form: {
    gap: spacing.md,
  },
  label: {
    color:         textMuted,
    fontSize:      fontSizes.label,
    fontWeight:    fontWeights.black,
    letterSpacing: letterSpacing.label,
  },
  inputBox: {
    backgroundColor: background,
    borderWidth:     1,
    borderColor:     border,
    borderRadius:    radius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    color:           textPrimary,
    fontSize:        fontSizes.body,
    paddingVertical: 14,
  },
  btn: {
    marginTop: spacing.xs,
  },
  errorBox: {
    backgroundColor: dangerLight,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     'rgba(255,82,82,0.3)',
    padding:         spacing.md,
  },
  errorText: {
    color:      danger,
    fontSize:   fontSizes.sub,
    fontWeight: fontWeights.bold,
  },
  backLink: {
    alignSelf: 'center',
    marginTop: spacing.xs,
    padding:   spacing.xs,
  },
  backLinkText: {
    color:      primary,
    fontSize:   fontSizes.sub,
    fontWeight: fontWeights.bold,
  },
  successContent: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap:            spacing.md,
  },
  successBadge: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: successLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  successCheck: {
    color:      success,
    fontSize:   36,
    fontWeight: fontWeights.black,
  },
  successTitle: {
    color:      textPrimary,
    fontSize:   fontSizes.h3,
    fontWeight: fontWeights.black,
  },
  successSub: {
    color:    textMuted,
    fontSize: fontSizes.body,
    textAlign: 'center',
  },
})
