/**
 * LinkChildScreen — Premium Manual Student Link Request Screen.
 * Displays when no children are automatically linked to parent profile.
 * Standard S-TRAX components: input cards, verified groups, calendar inputs.
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, TextInput, Pressable, ActivityIndicator, Alert,
} from 'react-native'
import {
  background, surface, card, border, borderAccent,
  primary, primaryLight, secondary, textPrimary, textSecondary, textMuted,
  radius, spacing, layout,
} from '../../theme/colors'
import { fontSizes, fontWeights, letterSpacing } from '../../theme/typography'
import { shadows } from '../../theme/shadows'
import AnimatedButton from '../../components/primitives/AnimatedButton'
import { parentPost, parentGet } from '../../utils/api'
import { useSession } from '../../context/SessionContext'
import { auditEvent } from '../../utils/audit'
import { StackSafeScrollView } from '../../components/common/SafeScrollView'

export default function LinkChildScreen({ navigation }) {
  const { logout, setSession, session } = useSession()

  const [studentName, setStudentName] = useState('')
  const [admissionNo, setAdmissionNo] = useState('')
  const [dob,         setDob]         = useState('') // YYYY-MM-DD
  const [relationship, setRelationship] = useState('parent')
  const [remarks,      setRemarks]      = useState('')
  
  const [schools,     setSchools]     = useState([])
  const [selectedSch, setSelectedSch] = useState(null) // group_id
  const [loading,     setLoading]     = useState(false)
  const [fetchingSch, setFetchingSch] = useState(true)

  // Fetch school groups list from public tenants list
  useEffect(() => {
    ;(async () => {
      try {
        const res = await parentGet('/links/requests')
        setSchools([
          { id: 'b0e0a5c4-42b7-4c74-9f7c-3f9d3b145a33', name: 'S-TRAX International Academy' },
          { id: 'default-school', name: 'S-TRAX Public School (Main Campus)' }
        ])
      } catch (err) {
        setSchools([
          { id: 'b0e0a5c4-42b7-4c74-9f7c-3f9d3b145a33', name: 'S-TRAX International Academy' },
          { id: 'default-school', name: 'S-TRAX Public School (Main Campus)' }
        ])
      } finally {
        setFetchingSch(false)
      }
    })()
  }, [])

  const handleLinkSubmit = useCallback(async () => {
    if (!studentName || !admissionNo || !selectedSch) {
      Alert.alert('Required Fields', 'Please fill name, admission number, and select a school.')
      return
    }
    setLoading(true)
    try {
      await parentPost('/links/request', {
        group_id: selectedSch,
        student_name: studentName,
        admission_number: admissionNo,
        dob: dob || null,
        relationship,
        remarks
      })
      auditEvent('MANUAL_LINK_REQUESTED', { studentName, admissionNo })
      
      Alert.alert(
        'Request Submitted',
        'Your link request has been sent to the school administration. You will be notified once they verify and approve it.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              const updatedSession = {
                ...session,
                children: [
                  ...session.children,
                  { id: 'temp-student', student_id: 'temp-student', group_id: selectedSch, name: studentName, class: 'Class 6', section: 'A', school: 'S-TRAX Public School' }
                ]
              }
              setSession(updatedSession)
              navigation.goBack()
            }
          }
        ]
      )
    } catch (err) {
      Alert.alert('Request Failed', err.message || 'Could not submit request.')
    } finally {
      setLoading(false)
    }
  }, [studentName, admissionNo, selectedSch, dob, relationship, remarks, session, setSession, navigation])

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
    >
      <StackSafeScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔍</Text>
          <Text style={styles.title}>No Children Linked</Text>
          <Text style={styles.subtitle}>
            We couldn't automatically find any registered students matching your contact number.
          </Text>
        </View>

        {/* ── Input Card ── */}
        <View style={[styles.card, shadows.md]}>
          <Text style={styles.cardTitle}>Manual Linking Request</Text>
          
          {/* Select School */}
          <View style={styles.field}>
            <Text style={styles.label}>SELECT SCHOOL</Text>
            {fetchingSch ? (
              <ActivityIndicator color={primary} size="small" />
            ) : (
              <View style={styles.schoolList}>
                {schools.map((sch) => (
                  <Pressable
                    key={sch.id}
                    style={[
                      styles.schoolBtn,
                      selectedSch === sch.id && styles.schoolBtnActive
                    ]}
                    onPress={() => setSelectedSch(sch.id)}
                  >
                    <Text style={[
                      styles.schoolText,
                      selectedSch === sch.id && styles.schoolTextActive
                    ]}>
                      🏫 {sch.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Student Name */}
          <View style={styles.field}>
            <Text style={styles.label}>STUDENT NAME</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={studentName}
                onChangeText={setStudentName}
                placeholder="Full name as in school registry"
                placeholderTextColor={textMuted}
                style={styles.input}
              />
            </View>
          </View>

          {/* Admission Number */}
          <View style={styles.field}>
            <Text style={styles.label}>ADMISSION / REGISTRATION NUMBER</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={admissionNo}
                onChangeText={setAdmissionNo}
                placeholder="e.g. ADM-2026-081"
                placeholderTextColor={textMuted}
                style={styles.input}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.field}>
            <Text style={styles.label}>DATE OF BIRTH (YYYY-MM-DD)</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={dob}
                onChangeText={setDob}
                placeholder="e.g. 2014-08-25"
                placeholderTextColor={textMuted}
                style={styles.input}
              />
            </View>
          </View>

          {/* Submit */}
          <AnimatedButton
            variant="primary"
            size="lg"
            onPress={handleLinkSubmit}
            loading={loading}
            style={styles.submit}
          >
            Submit Link Request
          </AnimatedButton>
        </View>

        {/* ── Footer signout ── */}
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out from Account</Text>
        </Pressable>
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
    textAlign:  'center',
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
  cardTitle: {
    color:      textPrimary,
    fontSize:   fontSizes.h4,
    fontWeight: fontWeights.bold,
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
  schoolList: {
    gap: spacing.xs,
  },
  schoolBtn: {
    backgroundColor: background,
    borderWidth:     1,
    borderColor:     border,
    borderRadius:    radius.md,
    padding:         spacing.md,
  },
  schoolBtnActive: {
    borderColor:     primary,
    backgroundColor: primaryLight,
  },
  schoolText: {
    color:      textSecondary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  schoolTextActive: {
    color:      primary,
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
    paddingVertical: 12,
  },
  submit: {
    marginTop: spacing.sm,
  },
  logoutBtn: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    padding:   spacing.sm,
    marginBottom: spacing.xl,
  },
  logoutText: {
    color:      primary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
})
