import React, { useMemo, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { background, border, card, primary, radius, textMuted, textPrimary, textSecondary } from '../../theme/colors.js'
import { StackSafeScrollView } from '../../components/common/SafeScrollView.js'
import Button from '../../components/common/Button.js'
import useOtpCountdown from '../../hooks/useOtpCountdown.js'
import useResponsiveLayout from '../../hooks/useResponsiveLayout.js'
import { auditEvent } from '../../utils/audit.js'
import { resolveParentSession } from '../../utils/parentSession.js'

export default function OTPScreen({ navigation, route, onVerified }) {
  const { width } = useWindowDimensions()
  const layout = useResponsiveLayout({ tabBarHeight: 0 })
  const contentInnerWidth = Math.min(layout.maxContentWidth, width - 2 * layout.horizontalPadding)
  const { mobile, countryCode } = route?.params || {}
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const inputRefs = useRef([])
  const { formatted, secondsLeft, restart } = useOtpCountdown(30)

  const digitSize = width < 340 ? 44 : width < 400 ? 48 : 52
  const digitFont = width < 340 ? 16 : 18
  const digitGap = width < 340 ? 6 : 10

  const title = useMemo(() => 'OTP Verification', [])
  const subtitle = useMemo(
    () => `Enter the 6-digit code sent to ${countryCode || '+91'} ${mobile || ''}.`,
    [countryCode, mobile]
  )

  const setDigitAt = (idx, text) => {
    const clean = String(text || '').replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = clean
    setDigits(next)

    if (clean && idx < 5) {
      const nextRef = inputRefs.current[idx + 1]
      nextRef?.focus?.()
    }
  }

  const canVerify = digits.every((d) => String(d || '').length === 1)

  const onVerify = () => {
    const otp = digits.join('')
    if (!canVerify) {
      auditEvent('LOGIN_FAILED', { reason: 'OTP_INCOMPLETE', mobile })
      setOtpError('Please enter complete 6-digit OTP.')
      return
    }
    if (otp !== '123456') {
      auditEvent('LOGIN_FAILED', { reason: 'OTP_INVALID', mobile })
      setOtpError('Invalid OTP. Please use 123456 for now.')
      return
    }
    setOtpError('')
    const session = resolveParentSession({ countryCode, mobile })
    auditEvent('LOGIN_SUCCESS', { mobile, mode: session.mode })
    onVerified?.(session, otp)
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StackSafeScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>One-time password</Text>

          <View style={[styles.digitsRow, { gap: digitGap }]}>
            {digits.map((d, idx) => (
              <TextInput
                key={idx}
                value={d}
                autoFocus={idx === 0}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={1}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                onChangeText={(t) => setDigitAt(idx, t)}
                style={[
                  styles.digit,
                  {
                    height: digitSize,
                    minWidth: Math.max(36, (contentInnerWidth - 36 - digitGap * 5) / 6),
                    fontSize: digitFont,
                    borderRadius: digitSize * 0.3,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.resendRow}>
            <Text style={styles.helper}>Didn’t receive code? Resend in {formatted}</Text>
            <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.changeNumberBtn, pressed && styles.changeNumberBtnPressed]}>
              <Text style={styles.changeNumberText}>Change number</Text>
            </Pressable>
          </View>

          <View style={styles.resendWrap}>
            <Button
              variant="outline"
              onPress={() => {
                if (secondsLeft > 0) return
                auditEvent('LOGIN_OTP_SENT', { resend: true, mobile })
                restart()
                setDigits(['', '', '', '', '', ''])
                setOtpError('')
              }}
              disabled={secondsLeft > 0}
            >
              Resend OTP
            </Button>
          </View>

          <View style={styles.demoHintWrap}>
            <Text style={styles.demoHintText}>Dummy OTP (current): 123456</Text>
          </View>

          {otpError ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{otpError}</Text>
            </View>
          ) : null}

          <View style={styles.verifyWrap}>
            <Button variant="primary" onPress={onVerify} disabled={!canVerify} accessibilityLabel="Verify OTP">
              Verify
            </Button>
          </View>
        </View>
      </StackSafeScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: background,
  },
  header: {
    borderWidth: 1,
    borderColor: border,
    backgroundColor: 'rgba(23,40,69,0.92)',
    borderRadius: radius.lg,
    padding: 14,
  },
  title: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 20,
  },
  subtitle: {
    marginTop: 4,
    color: textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    marginTop: 6,
    backgroundColor: card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: border,
    padding: 16,
  },
  label: {
    color: textSecondary,
    fontWeight: '800',
    fontSize: 12,
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    marginTop: 14,
  },
  digit: {
    flex: 1,
    backgroundColor: 'rgba(11,23,48,0.6)',
    borderWidth: 1,
    borderColor: border,
    color: textPrimary,
    textAlign: 'center',
    fontWeight: '900',
    paddingHorizontal: 0,
  },
  helper: {
    marginTop: 14,
    color: textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  resendRow: {
    marginTop: 4,
    gap: 8,
  },
  changeNumberBtn: {
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.45)',
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  changeNumberBtnPressed: {
    opacity: 0.8,
  },
  changeNumberText: {
    color: primary,
    fontSize: 12,
    fontWeight: '800',
  },
  resendWrap: {
    marginTop: 10,
  },
  demoHintWrap: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.45)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(250,204,21,0.14)',
  },
  demoHintText: {
    color: textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  errorWrap: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.55)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(239,68,68,0.16)',
  },
  errorText: {
    color: '#FECACA',
    fontSize: 12,
    fontWeight: '800',
  },
  verifyWrap: {
    marginTop: 18,
  },
})
