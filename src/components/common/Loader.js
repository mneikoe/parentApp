import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { primary } from '../../theme/colors'

export default function Loader({ size = 'large', style }) {
  return (
    <View style={[styles.wrap, style]}>
      <ActivityIndicator size={size} color={primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

