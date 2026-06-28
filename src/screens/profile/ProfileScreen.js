/**
 * ProfileScreen v2 — Premium parent & child profile screen.
 * Avatar hero section, sectioned info cards, verified badges, sign out.
 */

import React, { useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, Animated, Image,
} from 'react-native'
import {
  background, surface, card, border, borderAccent,
  primary, primaryLight,
  success, successLight,
  textPrimary, textSecondary, textMuted,
  radius, spacing, layout,
} from '../../theme/colors'
import { fontSizes, fontWeights, letterSpacing } from '../../theme/typography'
import { entrance } from '../../theme/motion'
import { useSession } from '../../context/SessionContext'
import Avatar         from '../../components/primitives/Avatar'
import AnimatedButton from '../../components/primitives/AnimatedButton'
import SectionHeader  from '../../components/primitives/SectionHeader'
import PremiumCard    from '../../components/primitives/PremiumCard'
import { API_BASE }   from '../../utils/api'

import { TabSafeScrollView } from '../../components/common/SafeScrollView'

const InfoRow = ({ label, value, accent = false }) => (
  <View style={infoStyles.row}>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={[infoStyles.value, accent && { color: primary }]} numberOfLines={2}>
      {value || '—'}
    </Text>
  </View>
)

const infoStyles = StyleSheet.create({
  row: {
    paddingVertical:  spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: border,
    gap:              4,
  },
  label: {
    color:         textMuted,
    fontSize:      fontSizes.caption,
    fontWeight:    fontWeights.bold,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  value: {
    color:      textPrimary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
})

export default function ProfileScreen() {
  const { session, parentName, parentPhone, children: sessionChildren, logout } = useSession()

  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    entrance(fadeAnim, slideAnim).start()
  }, [])

  // children from session — populated by DashboardScreen when loaded
  const childrenList = sessionChildren || []

  return (
    <TabSafeScrollView showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* ── Parent Hero ── */}
        <View style={styles.hero}>
          <Avatar name={parentName || 'P'} size="xl" ring="active" />
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{parentName || 'Parent'}</Text>
            <Text style={styles.heroPhone}>{parentPhone || '—'}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified Parent</Text>
            </View>
          </View>
        </View>

        {/* ── Parent Details Card ── */}
        <PremiumCard style={styles.section} padding={false}>
          <View style={styles.cardPad}>
            <Text style={styles.cardTitle}>Parent Information</Text>
            <InfoRow label="Mobile Number" value={parentPhone} accent />
            
            {/* Email Address */}
            <InfoRow 
              label="Email Address" 
              value={session?.email && !session?.email.includes('.local') ? session.email : 'Not Linked'} 
            />

            {/* Email Verification Status */}
            <View style={infoStyles.row}>
              <Text style={infoStyles.label}>Email Status</Text>
              {session?.email_verified && session?.email && !session?.email.includes('.local') ? (
                <View style={[styles.statusBadge, { backgroundColor: successLight, borderColor: success + '40', borderWidth: 1 }]}>
                  <Text style={[styles.statusText, { color: success }]}>✓ Verified</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: '#FFF0F0', borderColor: '#FFC1C1', borderWidth: 1 }]}>
                  <Text style={[styles.statusText, { color: '#FF3B30' }]}>⚠️ Unverified</Text>
                </View>
              )}
            </View>

            <InfoRow label="Linked Children" value={`${childrenList.length} student${childrenList.length !== 1 ? 's' : ''}`} />
            
            <View style={[infoStyles.row, { borderBottomWidth: 0 }]}>
              <Text style={infoStyles.label}>Account Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: successLight }]}>
                <Text style={[styles.statusText, { color: success }]}>Active</Text>
              </View>
            </View>
          </View>
        </PremiumCard>

        {/* ── Children ── */}
        {childrenList.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Linked Students" subtitle={`${childrenList.length} registered`} />
            {childrenList.map((child, i) => {
              const avatarUri = child.photo_url ? `${API_BASE}${child.photo_url}` : null;
              return (
                <PremiumCard
                  key={child.student_id || i}
                  style={i > 0 ? { marginTop: spacing.md } : null}
                  padding={false}
                >
                  <View style={styles.cardPad}>
                    <View style={styles.childHeader}>
                      <View style={[styles.childAvatar, { width: 36, height: 36, borderRadius: 18, backgroundColor: primary + '20', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }]}>
                        {avatarUri ? (
                          <Image source={{ uri: avatarUri }} style={{ width: 36, height: 36 }} />
                        ) : (
                          <Text style={{ color: primary, fontWeight: fontWeights.bold, fontSize: fontSizes.caption }}>
                            {(child.full_name || child.first_name || 'S')[0].toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={styles.childName}>
                          {child.full_name || `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Student'}
                        </Text>
                        <Text style={styles.childMeta}>
                          {[child.class_name, child.section_name].filter(Boolean).join(' · ') || 'No Class Assigned'}
                        </Text>
                      </View>
                    </View>
                    {child.school_name ? <InfoRow label="School" value={child.school_name} /> : null}
                    {child.admission_number ? <InfoRow label="Admission Number" value={child.admission_number} accent /> : null}
                  </View>
                </PremiumCard>
              );
            })}
          </View>
        ) : null}

        {/* ── App Info ── */}
        <PremiumCard style={styles.section} variant="glass" padding={false}>
          <View style={styles.cardPad}>
            <Text style={styles.cardTitle}>About STRAX</Text>
            <InfoRow label="App Version"       value="2.0.0" />
            <InfoRow label="Backend Connected" value="✓ Secure Connection" accent />
            <View style={[infoStyles.row, { borderBottomWidth: 0 }]}>
              <Text style={infoStyles.label}>Support</Text>
              <Text style={[infoStyles.value, { color: primary }]}>support@strax.in</Text>
            </View>
          </View>
        </PremiumCard>

        {/* ── Sign Out ── */}
        <View style={styles.section}>
          <AnimatedButton
            variant="danger"
            size="md"
            onPress={logout}
            accessibilityLabel="Sign out"
          >
            Sign Out
          </AnimatedButton>
          <Text style={styles.signOutNote}>
            You'll need to verify your mobile number again to log back in.
          </Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </Animated.View>
    </TabSafeScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: background,
  },
  scroll: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop:        spacing.xl,
  },
  section: {
    marginTop: layout.sectionGap,
  },
  // ── Hero ──
  hero: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.xl,
    backgroundColor: card,
    borderRadius:    radius.xxl,
    borderWidth:     1,
    borderColor:     borderAccent,
    padding:         spacing.xl,
  },
  heroInfo: {
    flex: 1,
    gap:  spacing.xs,
  },
  heroName: {
    color:      textPrimary,
    fontSize:   fontSizes.h3,
    fontWeight: fontWeights.black,
  },
  heroPhone: {
    color:    textSecondary,
    fontSize: fontSizes.body,
  },
  verifiedBadge: {
    alignSelf:         'flex-start',
    backgroundColor:   successLight,
    borderRadius:      radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    marginTop:         spacing.xs,
  },
  verifiedText: {
    color:      success,
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
  },
  // ── Card ──
  cardPad: {
    padding: spacing.lg,
  },
  cardTitle: {
    color:      textPrimary,
    fontSize:   fontSizes.h4,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    alignSelf:         'flex-start',
    borderRadius:      radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
  },
  statusText: {
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
  },
  // ── Child ──
  childHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.md,
    marginBottom:   spacing.sm,
  },
  childName: {
    color:      textPrimary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  childMeta: {
    color:    textMuted,
    fontSize: fontSizes.caption,
    marginTop: 2,
  },
  // ── Sign Out ──
  signOutNote: {
    color:     textMuted,
    fontSize:  fontSizes.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
})
