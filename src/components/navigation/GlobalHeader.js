/**
 * GlobalHeader.js
 * ─────────────────────────────────────────────────────────────
 * Global top header component for Parent App.
 * Displays greeting/parent info on left, child switcher in center, and notification bell on right.
 */

import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, Pressable, Image, StyleSheet, Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  background, surface, border, card, primary, primaryLight,
  textPrimary, textSecondary, textMuted, radius, spacing, layout
} from '../../theme/colors'
import { fontSizes, fontWeights } from '../../theme/typography'
import { useSession } from '../../context/SessionContext'
import { parentGet, API_BASE } from '../../utils/api'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function GlobalHeader() {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const {
    parentName, children: allChildren, activeChild, setActiveChild
  } = useSession()

  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    try {
      const res = await parentGet('/notifications/unread-count')
      setUnreadCount(res.unreadCount || 0)
    } catch {
      // silent fail
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const currentChild = activeChild || allChildren[0] || null

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.content}>
        
        {/* Left Side: Parent Details & Greeting */}
        <View style={styles.leftContainer}>
          <Text style={styles.greeting} numberOfLines={1}>{getGreeting()}</Text>
          <Text style={styles.parentName} numberOfLines={1}>{parentName || 'Parent'} 👋</Text>
        </View>

        {/* Center: Child Switcher */}
        {allChildren.length > 0 && (
          <View style={styles.centerContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.switcherScroll}
            >
              {allChildren.map((child, idx) => {
                const isActive = child.student_id === currentChild?.student_id
                const avatarUri = child.photo_url ? `${API_BASE}${child.photo_url}` : null
                return (
                  <Pressable
                    key={child.student_id || idx}
                    style={[styles.childChip, isActive && styles.childChipActive]}
                    onPress={() => setActiveChild(child)}
                  >
                    <View style={[styles.childAvatar, isActive && styles.childAvatarActive]}>
                      {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={{ width: 22, height: 22, borderRadius: 11 }} />
                      ) : (
                        <Text style={[styles.childAvatarText, isActive && { color: '#fff' }]}>
                          {(child.full_name || child.first_name || 'S')[0].toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.childChipText, isActive && styles.childChipTextActive]}>
                      {child.first_name || child.full_name?.split(' ')[0] || 'Student'}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        )}

        {/* Right Side: Notification Bell */}
        <View style={styles.rightContainer}>
          <Pressable
            style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.navigate('NotificationCenter')}
            accessibilityLabel="Notifications"
          >
            <Text style={styles.bellEmoji}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: card,
    borderBottomWidth: 1,
    borderBottomColor: border,
    paddingBottom: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
  },
  leftContainer: {
    flex: 2.2,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  greeting: {
    color: textMuted,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.medium,
  },
  parentName: {
    color: textPrimary,
    fontSize: fontSizes.body - 1,
    fontWeight: fontWeights.black,
    marginTop: 1,
  },
  switcherScroll: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: surface,
    borderWidth: 1,
    borderColor: border,
    borderRadius: radius.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  childChipActive: {
    borderColor: primary,
    backgroundColor: primaryLight,
  },
  childAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  childAvatarActive: {
    backgroundColor: primary,
  },
  childAvatarText: {
    fontSize: fontSizes.caption - 1,
    fontWeight: fontWeights.bold,
    color: textSecondary,
  },
  childChipText: {
    fontSize: fontSizes.caption - 1,
    color: textSecondary,
  },
  childChipTextActive: {
    color: primary,
    fontWeight: 'bold',
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: surface,
    borderWidth: 1,
    borderColor: border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellEmoji: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: primary,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
})
