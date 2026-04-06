import React from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { primary, success, warning, danger, textSecondary } from '../../theme/colors'

const toneStyles = {
  neutral: { backgroundColor: 'rgba(100,116,139,0.12)', borderColor: 'rgba(100,116,139,0.25)', textColor: textSecondary },
  primary: { backgroundColor: 'rgba(37,99,235,0.14)', borderColor: 'rgba(37,99,235,0.40)', textColor: primary },
  success: { backgroundColor: 'rgba(34,197,94,0.16)', borderColor: 'rgba(34,197,94,0.35)', textColor: success },
  warning: { backgroundColor: 'rgba(245,158,11,0.16)', borderColor: 'rgba(245,158,11,0.35)', textColor: warning },
  danger: { backgroundColor: 'rgba(239,68,68,0.16)', borderColor: 'rgba(239,68,68,0.35)', textColor: danger },
}

export default function Badge({ tone = 'neutral', children, style }) {
  const t = toneStyles[tone] || toneStyles.neutral
  return (
    <View style={[styles.base, { backgroundColor: t.backgroundColor, borderColor: t.borderColor }, style]}>
      <Text style={[styles.text, { color: t.textColor }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
})

