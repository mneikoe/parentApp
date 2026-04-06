import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { primary, surface, textPrimary, textSecondary, radius } from '../../theme/colors'

export default function AppHeader({
  title,
  subtitle,
  onBack,
  right,
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.left}>
          {onBack ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack}
              style={styles.backButton}
            >
              <Text style={styles.backText}>{'‹'}</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.titles}>
            <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
            {subtitle ? <Text style={styles.subtitleText} numberOfLines={3}>{subtitle}</Text> : null}
          </View>
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.25)',
  },
  backText: {
    color: primary,
    fontSize: 18,
    fontWeight: '700',
  },
  titles: {
    flexShrink: 1,
    minWidth: 0,
  },
  titleText: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitleText: {
    color: textSecondary,
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
  },
  right: {
    marginLeft: 10,
  },
})

