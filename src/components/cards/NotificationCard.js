/**
 * NotificationCard — Card for school notifications/announcements.
 * Shows category icon, title, preview, time, and unread indicator.
 *
 * Usage:
 *   <NotificationCard notification={item} onPress={open} />
 */

import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, Pressable, StyleSheet } from 'react-native';
import {
  card, border, primary, primaryLight,
  textPrimary, textSecondary, textMuted,
  radius, spacing,
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { fadeIn, durations } from '../../theme/motion';

const CATEGORY_MAP = {
  ANNOUNCEMENT:  { emoji: '📢', color: '#FF6A00' },
  ATTENDANCE:    { emoji: '📋', color: '#00C853' },
  FEE:           { emoji: '💳', color: '#FFC107' },
  EXAM:          { emoji: '📝', color: '#00F0FF' },
  TRANSPORT:     { emoji: '🚌', color: '#9B59B6' },
  HOLIDAY:       { emoji: '🏖️', color: '#27AE60' },
  HOMEWORK:      { emoji: '📚', color: '#3498DB' },
  CIRCULAR:      { emoji: '📄', color: '#9A9A9A' },
  DEFAULT:       { emoji: '🔔', color: '#FF6A00' },
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffH = Math.floor((now - d) / 3600000);
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const NotificationCard = React.memo(function NotificationCard({
  notification,
  onPress,
  style,
}) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeIn(fadeAnim, durations.normal).start();
  }, []);

  const cat  = CATEGORY_MAP[notification?.category] || CATEGORY_MAP.DEFAULT;
  const isNew = !notification?.readAt;

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={()  => Animated.spring(scaleAnim, { toValue: 0.98, tension: 200, friction: 20, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1,    tension: 80,  friction: 8,  useNativeDriver: true }).start()}
        disabled={!onPress}
      >
        <Animated.View
          style={[
            styles.card,
            isNew && { borderColor: cat.color + '35' },
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Unread indicator */}
          {isNew ? (
            <View style={[styles.unreadDot, { backgroundColor: cat.color }]} />
          ) : null}

          <View style={[styles.iconWrap, { backgroundColor: cat.color + '18' }]}>
            <Text style={styles.icon}>{cat.emoji}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {notification?.title || 'Notification'}
              </Text>
              <Text style={styles.time}>{formatTime(notification?.createdAt)}</Text>
            </View>
            <Text style={styles.body} numberOfLines={2}>
              {notification?.message || notification?.body || ''}
            </Text>
            {notification?.category ? (
              <Text style={[styles.category, { color: cat.color }]}>
                {notification.category.toLowerCase()}
              </Text>
            ) : null}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

export default NotificationCard;

const styles = StyleSheet.create({
  card: {
    flexDirection:   'row',
    backgroundColor: card,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.md,
    gap:             spacing.md,
    position:        'relative',
    overflow:        'hidden',
  },
  unreadDot: {
    position:     'absolute',
    top:          spacing.md,
    right:        spacing.md,
    width:        7,
    height:       7,
    borderRadius: 3.5,
  },
  iconWrap: {
    width:          44,
    height:         44,
    borderRadius:   radius.md,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    gap:            spacing.sm,
  },
  title: {
    flex:       1,
    color:      textPrimary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  time: {
    color:      textMuted,
    fontSize:   fontSizes.caption,
    flexShrink: 0,
  },
  body: {
    color:      textSecondary,
    fontSize:   fontSizes.sub,
    lineHeight: 20,
  },
  category: {
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop:  2,
  },
});
