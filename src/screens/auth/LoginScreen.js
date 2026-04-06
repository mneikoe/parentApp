import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  background,
  border,
  card,
  primary,
  radius,
  secondary,
  surface,
  textMuted,
  textPrimary,
  textSecondary,
} from '../../theme/colors'
import { StackSafeScrollView } from '../../components/common/SafeScrollView'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { auditEvent } from '../../utils/audit'

const LANGUAGES = ['English', 'Hindi', 'Tamil']

export default function LoginScreen({ navigation }) {
  const [countryCode, setCountryCode] = useState('+91')
  const [mobile, setMobile] = useState('')
  const [language, setLanguage] = useState('English')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const onGetOtp = () => {
    const normalizedMobile = String(mobile || '').replace(/\D/g, '')
    if (normalizedMobile.length < 8) return
    auditEvent('LOGIN_OTP_SENT', { countryCode, mobile: normalizedMobile })
    navigation.navigate('OTP', {
      countryCode,
      mobile: normalizedMobile,
    })
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StackSafeScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollExtra}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>Parent Panel</Text>
          <Text style={styles.subtitle}>Mobile + OTP login only</Text>
        </View>

        <View style={styles.cardWrap}>
          <Text style={styles.cardTitle}>Login</Text>
          <Text style={styles.cardHint}>Enter mobile number to continue</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.mobileRow}>
              <View style={styles.countryCodeBox}>
                <Input
                  value={countryCode}
                  onChangeText={setCountryCode}
                  placeholder="+91"
                  keyboardType="default"
                  autoCapitalize="none"
                  style={styles.countryCodeInput}
                />
              </View>
              <View style={styles.mobileInputBox}>
                <Input
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <View style={styles.loginBtnWrap}>
            <Button
              variant="primary"
              onPress={onGetOtp}
              disabled={String(mobile || '').replace(/\D/g, '').length < 8}
            >
              Get OTP
            </Button>
          </View>
        </View>

        <View style={styles.bottomWrap}>
          <Pressable
            onPress={() => setShowLanguageMenu((prev) => !prev)}
            style={({ pressed }) => [styles.bottomLink, pressed && styles.bottomLinkPressed]}
          >
            <Text style={styles.bottomText}>Language: {language}</Text>
          </Pressable>

          {showLanguageMenu ? (
            <View style={styles.langMenu}>
              {LANGUAGES.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setLanguage(item)
                    setShowLanguageMenu(false)
                  }}
                  style={({ pressed }) => [styles.langItem, pressed && styles.bottomLinkPressed]}
                >
                  <Text style={styles.langItemText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable style={({ pressed }) => [styles.bottomLink, pressed && styles.bottomLinkPressed]}>
            <Text style={styles.bottomText}>Terms & Privacy</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.bottomLink, pressed && styles.bottomLinkPressed]}>
            <Text style={[styles.bottomText, { color: secondary }]}>Help / Support</Text>
          </Pressable>
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
  scrollExtra: {
    justifyContent: 'flex-start',
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 12,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250,204,21,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.45)',
  },
  logoText: {
    color: primary,
    fontWeight: '900',
    fontSize: 26,
  },
  title: {
    color: textPrimary,
    marginTop: 12,
    fontWeight: '900',
    fontSize: 24,
  },
  subtitle: {
    color: textMuted,
    marginTop: 4,
    fontWeight: '700',
  },
  cardWrap: {
    marginTop: 6,
    backgroundColor: card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: border,
    padding: 16,
  },
  cardTitle: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 20,
  },
  cardHint: {
    marginTop: 6,
    color: textSecondary,
    fontWeight: '700',
  },
  field: {
    marginTop: 14,
  },
  label: {
    color: textSecondary,
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 8,
  },
  mobileRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  countryCodeBox: {
    width: 92,
  },
  countryCodeInput: {
    textAlign: 'center',
  },
  mobileInputBox: {
    flex: 1,
    minWidth: 0,
  },
  loginBtnWrap: {
    marginTop: 18,
  },
  bottomWrap: {
    marginTop: 4,
    alignItems: 'center',
    gap: 10,
  },
  bottomLink: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bottomLinkPressed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bottomText: {
    color: textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  langMenu: {
    width: '100%',
    borderWidth: 1,
    borderColor: border,
    borderRadius: radius.md,
    backgroundColor: surface,
    overflow: 'hidden',
  },
  langItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  langItemText: {
    color: textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
})
