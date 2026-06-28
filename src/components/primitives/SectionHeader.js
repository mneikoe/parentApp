/**
 * SectionHeader — consistent section title with optional CTA.
 * Used to label every dashboard section.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { textPrimary, textMuted, primary, spacing } from '../../theme/colors';
import { fontSizes, fontWeights, letterSpacing } from '../../theme/typography';

const SectionHeader = React.memo(function SectionHeader({
  title,
  subtitle,
  ctaLabel,
  onCta,
  style,
}) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {ctaLabel && onCta ? (
        <Pressable onPress={onCta} hitSlop={8} accessibilityRole="button">
          <Text style={styles.cta}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

export default SectionHeader;

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing.md,
  },
  left: { flex: 1 },
  title: {
    color:          textPrimary,
    fontSize:       fontSizes.h4,
    fontWeight:     fontWeights.bold,
    letterSpacing:  letterSpacing.tight,
  },
  subtitle: {
    color:     textMuted,
    fontSize:  fontSizes.caption,
    marginTop: 2,
  },
  cta: {
    color:       primary,
    fontSize:    fontSizes.sub,
    fontWeight:  fontWeights.bold,
  },
});
