import React, { useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { textPrimary, textSecondary, danger, radius } from '../../theme/colors'
import { StackSafeScrollView } from '../../components/common/SafeScrollView'
import AppHeader from '../../components/common/AppHeader'
import SOSCard from '../../components/cards/SOSCard'
import { mockSos } from '../../utils/mockData'

export default function SOSScreen() {
  const [triggered, setTriggered] = useState(false)

  const statusText = triggered ? 'SOS requested — contacting safety team (UI only).' : mockSos.status

  const onEmergency = () => {
    setTriggered(true)
    Alert.alert('Emergency (UI)', 'In Phase 1, this is a UI-only action. Backend SOS is not implemented.')
  }

  return (
    <StackSafeScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="SOS" subtitle="Emergency alert for school safety team" />

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Tap the emergency button</Text>
        <Text style={styles.heroSub}>
          For immediate help, notify the school safety team instantly.
        </Text>

        <View style={styles.heroCard}>
          <SOSCard statusText={statusText} onPress={onEmergency} />
        </View>
      </View>

      <View style={styles.instructionsCard}>
        <Text style={styles.sectionTitle}>Safety Instructions</Text>
        {mockSos.instructions.map((x, idx) => (
          <View key={`${x}_${idx}`} style={styles.instructionRow}>
            <View style={styles.bullet} />
            <Text style={styles.instructionText}>{x}</Text>
          </View>
        ))}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          Phase 1 note: This screen is UI-ready only. Real SOS notifications and tracking will be added later.
        </Text>
      </View>
    </StackSafeScrollView>
  )
}

const styles = StyleSheet.create({
  hero: {},
  heroTitle: { color: textPrimary, fontWeight: '900', fontSize: 22 },
  heroSub: { marginTop: 8, color: textSecondary, fontWeight: '800', fontSize: 13, lineHeight: 18 },
  heroCard: { marginTop: 12 },
  instructionsCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    padding: 16,
  },
  sectionTitle: { color: textPrimary, fontWeight: '900', fontSize: 16, marginBottom: 12 },
  instructionRow: { flexDirection: 'row', gap: 12, marginTop: 12, alignItems: 'flex-start' },
  bullet: { width: 10, height: 10, borderRadius: 5, backgroundColor: danger, marginTop: 6 },
  instructionText: { color: textPrimary, fontWeight: '800', fontSize: 13, flex: 1, lineHeight: 18, minWidth: 0 },
  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    padding: 16,
  },
  noteText: { color: textSecondary, fontWeight: '800', fontSize: 12, lineHeight: 18 },
})
