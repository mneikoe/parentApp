/**
 * ProfileSetupScreen — Beautiful light-themed screen to capture
 * parent's name and address details using the backend Pincode Lookup API.
 */

import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, TextInput, Alert,
} from 'react-native'
import {
  background, surface, card, border, borderAccent,
  primary, primaryLight, textPrimary, textSecondary, textMuted,
  radius, spacing, layout,
} from '../../theme/colors'
import { fontSizes, fontWeights, letterSpacing } from '../../theme/typography'
import { shadows } from '../../theme/shadows'
import AnimatedButton from '../../components/primitives/AnimatedButton'
import { parentPatch, publicGet } from '../../utils/api'
import { useSession } from '../../context/SessionContext'
import { auditEvent } from '../../utils/audit'
import { StackSafeScrollView } from '../../components/common/SafeScrollView'
import { saveSession } from '../../utils/secureSession'

export default function ProfileSetupScreen({ navigation }) {
  const { session, setSession } = useSession()

  const [name, setName]         = useState('')
  const [pincode, setPincode]   = useState('')
  const [flat, setFlat]         = useState('')
  const [street, setStreet]     = useState('')
  const [city, setCity]         = useState('')
  const [state, setState]       = useState('')
  const [district, setDistrict] = useState('')
  
  const [loading, setLoading]       = useState(false)
  const [lookupLoading, setLookup] = useState(false)

  // Auto-lookup pincode when it reaches 6 digits
  const handlePincodeChange = useCallback(async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6)
    setPincode(clean)

    if (clean.length === 6) {
      setLookup(true)
      try {
        const res = await publicGet(`/api/address/pincode/${clean}`)
        if (res.city || res.district) {
          setCity(res.city || '')
          setState(res.state || '')
          setDistrict(res.district || '')
          auditEvent('PINCODE_LOOKUP_SUCCESS', { pincode: clean })
        } else {
          Alert.alert('Pincode Lookup', 'No address found for this pincode. Please enter manually.')
        }
      } catch (err) {
        console.warn('Pincode lookup failed:', err.message)
      } finally {
        setLookup(false)
      }
    }
  }, [])

  const handleSaveProfile = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Required Info', 'Please enter your full name.')
      return
    }
    setLoading(true)
    try {
      // 1. Save name to backend parent profiles
      await parentPatch('/profile', {
        full_name: name.trim()
      })

      // 2. Save full profile locally including address
      const updatedSession = {
        ...session,
        name:      name.trim(),
        full_name: name.trim(),   // needed for AppNavigator showSetup check
        address: {
          pincode,
          flat,
          street,
          city,
          state,
          district
        }
      }
      await saveSession(updatedSession)
      setSession(updatedSession)
      auditEvent('PROFILE_SETUP_COMPLETE', { name: name.trim() })
    } catch (err) {
      Alert.alert('Failed to save profile', err.message || 'Please try again.')
    } finally {
      setLoading(false)
    }
  }, [name, pincode, flat, street, city, state, district, session, setSession])

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
    >
      <StackSafeScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.title}>Complete Profile</Text>
          <Text style={styles.subtitle}>
            Please fill in your name and home address to complete account setup.
          </Text>
        </View>

        <View style={[styles.card, shadows.md]}>
          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.label}>FULL NAME</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={textMuted}
                style={styles.input}
              />
            </View>
          </View>

          {/* Pincode Lookup */}
          <View style={styles.field}>
            <Text style={styles.label}>PINCODE</Text>
            <View style={[styles.inputBox, lookupLoading && styles.disabledInput]}>
              <TextInput
                value={pincode}
                onChangeText={handlePincodeChange}
                placeholder="6-digit postal code"
                placeholderTextColor={textMuted}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
                editable={!lookupLoading}
              />
            </View>
          </View>

          {/* Address Fields */}
          <View style={styles.field}>
            <Text style={styles.label}>FLAT / HOUSE NO / APARTMENT</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={flat}
                onChangeText={setFlat}
                placeholder="e.g. Flat 302, Green Heights"
                placeholderTextColor={textMuted}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>STREET / AREA / LANDMARK</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={street}
                onChangeText={setStreet}
                placeholder="e.g. Near Central Park"
                placeholderTextColor={textMuted}
                style={styles.input}
              />
            </View>
          </View>

          {/* Readonly Pincode Lookups */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>CITY</Text>
              <View style={[styles.inputBox, styles.readonlyBox]}>
                <TextInput
                  value={city}
                  placeholder="City"
                  placeholderTextColor={textMuted}
                  style={styles.input}
                  editable={false}
                />
              </View>
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>STATE</Text>
              <View style={[styles.inputBox, styles.readonlyBox]}>
                <TextInput
                  value={state}
                  placeholder="State"
                  placeholderTextColor={textMuted}
                  style={styles.input}
                  editable={false}
                />
              </View>
            </View>
          </View>

          <AnimatedButton
            variant="primary"
            size="lg"
            onPress={handleSaveProfile}
            loading={loading}
            style={styles.submit}
          >
            Save & Continue
          </AnimatedButton>
        </View>
      </StackSafeScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: background,
  },
  header: {
    alignItems:     'center',
    gap:            spacing.sm,
    marginBottom:   spacing.xl,
  },
  emoji: {
    fontSize:     48,
    marginBottom: spacing.sm,
  },
  title: {
    color:      textPrimary,
    fontSize:   fontSizes.h2,
    fontWeight: fontWeights.black,
  },
  subtitle: {
    color:     textSecondary,
    fontSize:  fontSizes.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: card,
    borderRadius:    radius.xxl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.xl,
    gap:             spacing.md,
    marginBottom:    spacing.xl,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color:      textMuted,
    fontSize:   fontSizes.label,
    fontWeight: fontWeights.black,
    letterSpacing: letterSpacing.label,
  },
  inputBox: {
    backgroundColor: background,
    borderWidth:     1,
    borderColor:     border,
    borderRadius:    radius.md,
    paddingHorizontal: spacing.md,
  },
  readonlyBox: {
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
  },
  disabledInput: {
    opacity: 0.6,
  },
  input: {
    color:           textPrimary,
    fontSize:        fontSizes.body,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    gap:           spacing.md,
  },
  submit: {
    marginTop: spacing.sm,
  },
})
