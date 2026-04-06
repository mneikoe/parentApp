import React from 'react'
import { View, StyleSheet } from 'react-native'
import { card as cardColor, mutedBorder, radius } from '../../theme/colors'

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cardColor,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: mutedBorder,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
})

