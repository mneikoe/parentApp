import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { surface, textPrimary, textSecondary, radius } from '../../theme/colors'
import { TabSafeScrollView } from '../../components/common/SafeScrollView'
import AppHeader from '../../components/common/AppHeader'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { mockChat } from '../../utils/mockData'
import useResponsiveLayout from '../../hooks/useResponsiveLayout'

export default function ChatScreen() {
  const { width, height } = useWindowDimensions()
  const tabBarHeight = useBottomTabBarHeight()
  const layout = useResponsiveLayout({ tabBarHeight })

  const [selectedThreadId, setSelectedThreadId] = useState(mockChat.threads[0]?.id || null)
  const [draft, setDraft] = useState('')
  const [messagesByThread, setMessagesByThread] = useState(() => mockChat.messages)

  const twoColumn = width >= 640

  const bubbleAreaHeight = Math.min(360, Math.max(200, height * 0.28))

  const currentMessages = useMemo(() => {
    if (!selectedThreadId) return []
    return messagesByThread[selectedThreadId] || []
  }, [selectedThreadId, messagesByThread])

  const selectedThread = useMemo(() => {
    return mockChat.threads.find((t) => t.id === selectedThreadId) || null
  }, [selectedThreadId])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessagesByThread((prev) => ({
      ...prev,
      [selectedThreadId]: [
        ...(prev[selectedThreadId] || []),
        { id: `u_${Date.now()}`, who: 'parent', text, time },
      ],
    }))
    setDraft('')
  }

  const threadsCard = (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Threads</Text>
      <View style={styles.threadList}>
        {mockChat.threads.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setSelectedThreadId(t.id)}
            style={[styles.threadRow, selectedThreadId === t.id ? styles.threadRowActive : null]}
            activeOpacity={0.9}
          >
            <View style={styles.threadMain}>
              <Text style={styles.threadTitle}>{t.parent}</Text>
              <Text style={styles.threadSub}>{t.student}</Text>
              <Text style={styles.threadMsg} numberOfLines={1}>
                {t.lastMsg}
              </Text>
              <Text style={styles.threadTime}>{t.time}</Text>
            </View>
            {t.unread > 0 ? (
              <Badge tone="primary">{t.unread}</Badge>
            ) : (
              <View style={styles.threadSpacer} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const chatCard = (
    <View style={[styles.card, twoColumn && styles.chatCardFlex]}>
      <View style={styles.chatHeader}>
        <Text style={styles.sectionTitle} numberOfLines={2}>
          {selectedThread ? `${selectedThread.parent} (${selectedThread.student})` : 'Select a thread'}
        </Text>
      </View>

      <View style={[styles.bubblesWrap, { minHeight: bubbleAreaHeight, maxHeight: bubbleAreaHeight }]}>
        {currentMessages.map((m) => (
          <View
            key={m.id}
            style={[styles.bubbleRow, m.who === 'parent' ? styles.bubbleRowRight : styles.bubbleRowLeft]}
          >
            <View style={[styles.bubble, m.who === 'parent' ? styles.bubbleRight : styles.bubbleLeft]}>
              <Text style={styles.bubbleText}>{m.text}</Text>
              <Text style={styles.bubbleTime}>{m.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.composer, { gap: layout.gap }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor={textSecondary}
          style={styles.input}
          multiline
        />
        <Button
          variant="outline"
          onPress={() => {
            if (!selectedThreadId) return
            send()
          }}
          style={styles.sendBtn}
          accessibilityLabel="Send message"
        >
          Send
        </Button>
      </View>
    </View>
  )

  return (
    <TabSafeScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Chat" subtitle="Parent ↔ Teacher" />

      {twoColumn ? (
        <View style={[styles.splitRow, { gap: layout.gap }]}>
          <View style={[styles.splitCol, { minWidth: 0 }]}>{threadsCard}</View>
          <View style={[styles.splitCol, { minWidth: 0, flex: 1 }]}>{chatCard}</View>
        </View>
      ) : (
        <>
          {threadsCard}
          {chatCard}
        </>
      )}
    </TabSafeScrollView>
  )
}

const styles = StyleSheet.create({
  splitRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  splitCol: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    padding: 16,
  },
  chatCardFlex: {
    flex: 1,
  },
  sectionTitle: { color: textPrimary, fontWeight: '900', fontSize: 16, marginBottom: 12 },
  threadList: {},
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,234,242,1)',
    gap: 10,
  },
  threadRowActive: {
    backgroundColor: 'rgba(37,99,235,0.10)',
    borderRadius: 14,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderBottomColor: 'transparent',
  },
  threadMain: { flex: 1, minWidth: 0 },
  threadSpacer: { width: 8 },
  threadTitle: { color: textPrimary, fontWeight: '900', fontSize: 13 },
  threadSub: { marginTop: 4, color: textSecondary, fontWeight: '800', fontSize: 12 },
  threadMsg: { marginTop: 4, color: textSecondary, fontWeight: '700', fontSize: 12 },
  threadTime: { marginTop: 6, color: textSecondary, fontWeight: '700', fontSize: 11 },
  chatHeader: {
    marginBottom: 6,
  },
  bubblesWrap: {
    marginTop: 6,
  },
  bubbleRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    maxWidth: '88%',
  },
  bubbleRight: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderColor: 'rgba(37,99,235,0.35)',
  },
  bubbleLeft: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(229,234,242,1)',
  },
  bubbleText: { color: textPrimary, fontWeight: '800', fontSize: 13 },
  bubbleTime: { marginTop: 6, color: textSecondary, fontWeight: '700', fontSize: 11 },
  composer: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minWidth: 0,
    maxHeight: 110,
    minHeight: 44,
    backgroundColor: surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  sendBtn: {
    minWidth: 88,
    paddingHorizontal: 10,
  },
})
