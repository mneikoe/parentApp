import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { textPrimary, textSecondary } from '../../theme/colors'
import Card from '../common/Card'
import Button from '../common/Button'

export default function SOSCard({ statusText, onPress }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>SOS Alert</Text>
      <Text style={styles.status}>{statusText}</Text>
      <View style={styles.buttonWrap}>
        <Button variant="danger" onPress={onPress} accessibilityLabel="Trigger SOS">
          Emergency
        </Button>
      </View>
      <View style={styles.hintRow}>
        <Text style={styles.hint}>{'Tap to notify school safety team.'}</Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.10)',
  },
  title: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  status: {
    marginTop: 8,
    color: textSecondary,
    fontWeight: '700',
  },
  buttonWrap: {
    marginTop: 14,
  },
  hintRow: {
    marginTop: 10,
  },
  hint: {
    color: textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
})

