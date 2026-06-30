/**
 * NotificationCenterScreen.js
 * ─────────────────────────────────────────────────────────────
 * Parent App — Notification Inbox
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View, Text, FlatList, StyleSheet, Pressable,
  Animated, RefreshControl, ActivityIndicator,
} from 'react-native'
import {
  background, surface, card, border,
  primary, primaryLight,
  textPrimary, textSecondary, textMuted,
  radius, spacing, layout,
} from '../../theme/colors'
import { fontSizes, fontWeights } from '../../theme/typography'
import { entrance } from '../../theme/motion'
import { parentGet, parentPatch } from '../../utils/api'
import GlobalHeader from '../../components/navigation/GlobalHeader'
import EmptyState from '../../components/feedback/EmptyState'
import ErrorState from '../../components/feedback/ErrorState'

// ── Category → color/emoji map ────────────────────────────────
const CATEGORY_META = {
  GENERAL:      { color: '#2196F3', emoji: 'ℹ️' },
  ANNOUNCEMENT: { color: '#9C27B0', emoji: '📣' },
  ACADEMICS:    { color: '#4CAF50', emoji: '📚' },
  HOMEWORK:     { color: '#FF9800', emoji: '✏️' },
  EXAM:         { color: '#F44336', emoji: '📝' },
  RESULT:       { color: '#FFD700', emoji: '🏆' },
  FEES:         { color: '#009688', emoji: '💳' },
  PAYMENT:      { color: '#4CAF50', emoji: '💰' },
  TRANSPORT:    { color: '#FFEB3B', emoji: '🚌' },
  EVENT:        { color: '#E91E63', emoji: '🎉' },
  HOLIDAY:      { color: '#FF5722', emoji: '☀️' },
  EMERGENCY:    { color: '#D32F2F', emoji: '🚨' },
  SYSTEM:       { color: '#9E9E9E', emoji: '⚙️' },
}

const getMeta = (category) =>
  CATEGORY_META[String(category).toUpperCase()] || CATEGORY_META.GENERAL

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Single notification card ──────────────────────────────────
const NotifCard = React.memo(function NotifCard({ item, onMarkRead }) {
  const meta = getMeta(item.category)
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    if (!item.is_read) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start()
      onMarkRead(item.id)
    }
  }

  return (
    <Pressable onPress={handlePress} accessibilityLabel={`Notification: ${item.title}`}>
      <Animated.View
        style={[
          styles.card,
          !item.is_read && styles.cardUnread,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {!item.is_read && <View style={styles.unreadDot} />}

        <View style={[styles.badge, { backgroundColor: meta.color + '22', borderColor: meta.color + '44' }]}>
          <Text style={styles.badgeEmoji}>{meta.emoji}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.title, !item.is_read && styles.titleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={[styles.categoryPill, { color: meta.color, borderColor: meta.color + '44', backgroundColor: meta.color + '18' }]}>
              {item.category}
            </Text>
            {!item.is_read && (
              <Text style={styles.tapHint}>Tap to mark as read</Text>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  )
})

export default function NotificationCenterScreen() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]         = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(16)).current

  useEffect(() => { entrance(fadeAnim, slideAnim).start() }, [])

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await parentGet('/notifications/my')
      setNotifications(res.notifications || [])
    } catch (err) {
      setError('Could not load notifications. Pull to refresh.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [])

  const handleMarkRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    try {
      await parentPatch(`/notifications/read/${id}`)
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
      )
    }
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true)
    try {
      await parentPatch('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch {
      // silent
    } finally {
      setMarkingAll(false)
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading && !notifications.length) {
    return (
      <View style={{ flex: 1, backgroundColor: background }}>
        <GlobalHeader />
        <View style={styles.center}>
          <ActivityIndicator color={primary} size="large" />
        </View>
      </View>
    )
  }

  if (error && !notifications.length) {
    return (
      <View style={{ flex: 1, backgroundColor: background }}>
        <GlobalHeader />
        <ErrorState variant="apiError" message={error} onRetry={() => fetchNotifications()} />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <GlobalHeader />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              tintColor={primary}
              colors={[primary]}
            />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <View>
                <Text style={styles.pageTitle}>Alerts & Notifications</Text>
                <Text style={styles.pageSubtitle}>
                  {unreadCount > 0 ? `${unreadCount} new updates` : 'No unread notifications'}
                </Text>
              </View>

              {unreadCount > 0 && (
                <Pressable
                  onPress={handleMarkAllRead}
                  disabled={markingAll}
                  style={({ pressed }) => [
                    styles.markAllBtn,
                    pressed && { opacity: 0.7 },
                    markingAll && { opacity: 0.4 },
                  ]}
                >
                  <Text style={styles.markAllText}>
                    {markingAll ? 'Clearing…' : 'Clear all'}
                  </Text>
                </Pressable>
              )}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              emoji="🔔"
              title="No Notifications"
              description="Your inbox is clear! Any announcements or alerts from the school will appear here."
            />
          }
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <NotifCard item={item} onMarkRead={handleMarkRead} />
          )}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing.md,
    marginTop:      spacing.xs,
  },
  pageTitle: {
    color:      textPrimary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  pageSubtitle: {
    color:     textMuted,
    fontSize:  fontSizes.caption,
    marginTop: 1,
  },
  markAllBtn: {
    backgroundColor: primaryLight,
    borderRadius:    radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical:   4,
  },
  markAllText: {
    color:      primary,
    fontSize:   fontSizes.caption - 1,
    fontWeight: fontWeights.bold,
  },
  sep: {
    height: spacing.sm,
  },
  card: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             spacing.md,
    backgroundColor: card,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.md,
    position:        'relative',
  },
  cardUnread: {
    borderColor:     primary + '44',
    backgroundColor: primary + '08',
  },
  unreadDot: {
    position:        'absolute',
    top:             spacing.sm,
    right:           spacing.sm,
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: primary,
  },
  badge: {
    width:          36,
    height:         36,
    borderRadius:   radius.md,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    gap:  2,
  },
  topRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            spacing.xs,
  },
  title: {
    flex:       1,
    color:      textSecondary,
    fontSize:   fontSizes.sub,
    fontWeight: fontWeights.semiBold,
  },
  titleUnread: {
    color:      textPrimary,
    fontWeight: fontWeights.bold,
  },
  time: {
    color:      textMuted,
    fontSize:   fontSizes.caption - 1,
    flexShrink: 0,
  },
  message: {
    color:    textSecondary,
    fontSize: fontSizes.caption,
    lineHeight: fontSizes.caption * 1.4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent: 'space-between',
    marginTop:     4,
  },
  categoryPill: {
    fontSize:          fontSizes.caption - 2,
    fontWeight:        fontWeights.bold,
    textTransform:     'uppercase',
    letterSpacing:     0.5,
    borderWidth:       1,
    borderRadius:      radius.round,
    paddingHorizontal: 6,
    paddingVertical:   1,
  },
  tapHint: {
    color:    textMuted,
    fontSize: fontSizes.caption - 2,
    fontStyle: 'italic',
  },
})
