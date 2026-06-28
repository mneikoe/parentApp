/**
 * BottomTabBar — Custom premium bottom tab bar for STRAX Parent App.
 * Replaces React Navigation's default tab bar.
 * Animated active indicator, orange notification dot, platform-aware safe area.
 */

import React, { useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, Platform,
} from 'react-native';
import {
  background, surface, border, primary, primaryLight,
  textSecondary, textMuted, radius, spacing, layout,
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { durations, easings } from '../../theme/motion';
import { shadows } from '../../theme/shadows';

const TABS = [
  { key: 'Home',      label: 'Home',      emoji: '🏠' },
  { key: 'Academics', label: 'Academics', emoji: '📚' },
  { key: 'Transport', label: 'Transport', emoji: '🚌' },
  { key: 'Payments',  label: 'Fees',      emoji: '💳' },
  { key: 'Profile',   label: 'Profile',   emoji: '👤' },
];

const TabItem = React.memo(function TabItem({
  tab,
  isActive,
  onPress,
  hasNotification,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const labelAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.1 : 1,
        tension: 180,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(labelAnim, {
        toValue: isActive ? 1 : 0,
        duration: durations.fast,
        easing: easings.standard,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const iconColor = isActive ? primary : textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.iconWrap}>
          {isActive ? (
            <View style={styles.activeBlob} />
          ) : null}
          <Text style={[styles.emoji, { opacity: isActive ? 1 : 0.55 }]}>
            {tab.emoji}
          </Text>
          {hasNotification ? (
            <View style={styles.notifDot} />
          ) : null}
        </View>
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          { color: iconColor, opacity: labelAnim },
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
});

export default function BottomTabBar({ state, navigation, notifications = {} }) {
  return (
    <View style={[styles.container, shadows.lg]}>
      {TABS.map((tab, index) => {
        const route = state.routes.find((r) => r.name === tab.key);
        const routeIndex = state.routes.indexOf(route);
        const isActive = state.index === routeIndex;

        return (
          <TabItem
            key={tab.key}
            tab={tab}
            isActive={isActive}
            hasNotification={!!notifications[tab.key]}
            onPress={() => {
              if (!isActive) {
                navigation.navigate(tab.key);
              }
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    backgroundColor: surface,
    borderTopWidth:  1,
    borderTopColor:  border,
    height:          layout.tabBarHeight + (Platform.OS === 'ios' ? 20 : 0),
    paddingBottom:   Platform.OS === 'ios' ? 20 : 0,
    alignItems:      'center',
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    gap:            3,
    minHeight:      44,
  },
  iconWrap: {
    position:       'relative',
    alignItems:     'center',
    justifyContent: 'center',
    width:          40,
    height:         36,
  },
  activeBlob: {
    position:        'absolute',
    width:           40,
    height:          36,
    borderRadius:    radius.md,
    backgroundColor: primaryLight,
  },
  emoji: {
    fontSize:  22,
    zIndex:    1,
  },
  notifDot: {
    position:        'absolute',
    top:             2,
    right:           4,
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: primary,
    borderWidth:     1.5,
    borderColor:     surface,
    zIndex:          2,
  },
  label: {
    fontSize:   fontSizes.caption - 1,
    fontWeight: fontWeights.bold,
    textAlign:  'center',
  },
});
