import React from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { textPrimary, textSecondary, radius } from '../../theme/colors'
import { TabSafeScrollView } from '../../components/common/SafeScrollView'
import AppHeader from '../../components/common/AppHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { mockChild, mockParent } from '../../utils/mockData'
import useResponsiveLayout from '../../hooks/useResponsiveLayout'

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

export default function ProfileScreen({ onLogout }) {
  const tabBarHeight = useBottomTabBarHeight()
  const layout = useResponsiveLayout({ tabBarHeight })

  const handleLogout = () => {
    Alert.alert('Logout (UI)', 'You have been logged out locally for UI testing.')
    onLogout?.()
  }

  return (
    <TabSafeScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Profile" subtitle="Parent details & child profile" />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Parent</Text>
        <InfoRow label="Name" value={mockParent.name} />
        <InfoRow label="Mobile" value={mockParent.mobile} />
        <InfoRow label="Email" value={mockParent.email} />
        <View style={[styles.badgesRow, { flexWrap: 'wrap', gap: layout.gap }]}>
          <Badge tone="primary">Verified</Badge>
          <Badge tone="neutral">Family</Badge>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Child</Text>
        <InfoRow label="Name" value={mockChild.name} />
        <InfoRow label="Class" value={`${mockChild.className} · ${mockChild.section}`} />
        <InfoRow label="Bus" value={mockChild.bus} />
        <InfoRow label="Attendance" value={`${mockChild.attendancePct}%`} />
      </View>

      <View style={styles.logoutWrap}>
        <Button variant="danger" onPress={handleLogout}>
          Logout
        </Button>
      </View>
    </TabSafeScrollView>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    padding: 16,
  },
  sectionTitle: { color: textPrimary, fontWeight: '900', fontSize: 16, marginBottom: 10 },
  infoRow: { marginTop: 12 },
  infoLabel: { color: textSecondary, fontWeight: '800', fontSize: 12 },
  infoValue: { marginTop: 6, color: textPrimary, fontWeight: '900', fontSize: 14, flexShrink: 1 },
  badgesRow: { flexDirection: 'row', marginTop: 14 },
  logoutWrap: { marginTop: 2 },
})
