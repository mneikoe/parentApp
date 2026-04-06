import React, { useMemo, useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  background,
  border,
  card,
  danger,
  primary,
  radius,
  success,
  textMuted,
  textPrimary,
  textSecondary,
  warning,
} from '../../theme/colors'
import { StackSafeScrollView } from '../../components/common/SafeScrollView'
import Button from '../../components/common/Button'
import { auditEvent } from '../../utils/audit'

const DASHBOARD_CARDS = [
  {
    key: 'device',
    title: 'Safety & Device Status',
    summary: 'Primary: Online • Battery 74% • Last update: 2 min ago',
    status: 'healthy',
    module: 'S-TRAX Devices',
  },
  {
    key: 'tracking',
    title: 'Live Tracking Mini Map',
    summary: 'Zone: School • Movement: Stationary • Status: Live',
    status: 'healthy',
    module: 'Live Tracking',
  },
  {
    key: 'attendance',
    title: 'Attendance (RFID + Manual)',
    summary: 'Today: Present • Check-in: 8:17 AM • Mismatch: None',
    status: 'healthy',
    module: 'Attendance',
  },
  {
    key: 'transport',
    title: 'Transport / Bus',
    summary: 'Route Blue-3 • ETA 9 min • Boarding: Boarded',
    status: 'attention',
    module: 'Transport / Bus Tracking',
  },
  {
    key: 'academics',
    title: 'Academics Snapshot',
    summary: 'Latest score 87% • Trend improving • PTM Friday',
    status: 'healthy',
    module: 'Academics',
  },
  {
    key: 'homework',
    title: 'Homework Snapshot',
    summary: 'Pending: 2 • Overdue: 1 • Last feedback updated',
    status: 'attention',
    module: 'Homework & Classroom',
  },
  {
    key: 'fees',
    title: 'Finance / Fees',
    summary: 'Outstanding: INR 3,200 • Next due: 10 Apr',
    status: 'attention',
    module: 'Fees & Payments',
  },
]

const ALERTS_FEED = [
  'SOS: No active emergency',
  'Device offline alert resolved 1h ago',
  'Homework overdue: Mathematics Worksheet',
  'Fee reminder: April installment due in 7 days',
]

const QUICK_ACTIONS = [
  'Live Tracking',
  'Message Teacher',
  'Pay Fees',
  'View Homework',
  'SOS Timeline',
  'Documents',
  'Raise Ticket',
]

const MENU_GROUPS = [
  {
    title: 'Safety & Tracking',
    items: [
      'Live Tracking',
      'Tracking History',
      'Geofence & Safe Zones',
      'S-TRAX Devices',
      'Safety & Alerts',
      'Transport / Bus Tracking',
    ],
  },
  {
    title: 'School / ERP',
    items: ['Attendance', 'Academics', 'Homework & Classroom', 'PTM / Meetings', 'Communication'],
  },
  {
    title: 'Finance',
    items: ['Fees & Payments', 'Subscription'],
  },
  {
    title: 'Records & Files',
    items: ['Documents / Certificates', 'Report Cards', 'School Files'],
  },
  {
    title: 'Engagement',
    items: ['Learning & Gaming', 'Hostel / PG Finder'],
  },
  {
    title: 'Support',
    items: ['Help & Support', 'FAQ', 'Documentation', 'Ticket', 'Live Chat'],
  },
  {
    title: 'Account',
    items: ['Settings', 'Add / Link Child', 'Search School (Global)', 'Logout'],
  },
]

function getSafetyTone(status) {
  if (status === 'Alert') return styles.pillAlert
  if (status === 'Attention') return styles.pillAttention
  return styles.pillSafe
}

function getCardStatusStyle(status) {
  if (status === 'critical') return styles.statusCritical
  if (status === 'attention') return styles.statusAttention
  return styles.statusHealthy
}

function isLockedItem({ mode, item, activeChild }) {
  const alwaysAllowedInLimited = [
    'Help & Support',
    'FAQ',
    'Documentation',
    'Ticket',
    'Live Chat',
    'Hostel / PG Finder',
    'Search School (Global)',
  ]
  if (mode === 'pending') return !alwaysAllowedInLimited.includes(item)
  if (activeChild?.subscription === 'Expired') {
    const gated = [
      'Live Tracking',
      'Tracking History',
      'Geofence & Safe Zones',
      'Transport / Bus Tracking',
      'Safety & Alerts',
    ]
    return gated.includes(item)
  }
  return false
}

const TRACKING_MODULES = new Set([
  'Live Tracking',
  'Tracking History',
  'Geofence & Safe Zones',
  'S-TRAX Devices',
])

const SAFETY_MODULES = new Set(['Safety & Alerts', 'SOS Timeline'])
const TRANSPORT_MODULES = new Set(['Transport / Bus Tracking'])

export default function UnifiedPanelScreen({ session, onSessionUpdate, onLogout, onOpenModule }) {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const [moreOpen, setMoreOpen] = useState(false)
  const [childSelectorOpen, setChildSelectorOpen] = useState(false)
  const [activeModule, setActiveModule] = useState('Dashboard')
  const compactHeader = width < 390

  const activeChild = useMemo(() => {
    if (!session?.activeChildId) return null
    return session.linkedChildren.find((child) => child.id === session.activeChildId) || null
  }, [session])

  const linkedMode = session.mode === 'linked'
  const pendingMode = session.mode === 'pending'
  const unlinkedMode = session.mode === 'unlinked'

  const openModule = (moduleName) => {
    const locked = isLockedItem({ mode: session.mode, item: moduleName, activeChild })
    if (locked) {
      auditEvent('LOCKED_FEATURE_TAPPED', { module: moduleName, mode: session.mode })
      return
    }
    setActiveModule(moduleName)
    auditEvent('MENU_ITEM_OPENED', { module: moduleName })
    setMoreOpen(false)
    if (TRACKING_MODULES.has(moduleName)) {
      onOpenModule?.('tracking')
      return
    }
    if (SAFETY_MODULES.has(moduleName)) {
      onOpenModule?.('safety')
      return
    }
    if (TRANSPORT_MODULES.has(moduleName)) {
      onOpenModule?.('transport')
    }
  }

  const switchChild = (childId) => {
    onSessionUpdate({
      ...session,
      activeChildId: childId,
    })
    setChildSelectorOpen(false)
    auditEvent('CHILD_CHANGED', { childId })
  }

  const renderLimitedMode = () => (
    <View style={styles.sectionBlock}>
      <View style={[styles.panelCard, styles.awaitingBanner]}>
        <Text style={styles.awaitingTitle}>Awaiting School Approval</Text>
        <Text style={styles.awaitingText}>
          Request status and support modules are available. Tracking, attendance, academics,
          payments and communication stay locked until approval.
        </Text>
      </View>

      <View style={styles.panelCard}>
        <Text style={styles.sectionTitle}>Available in Limited Mode</Text>
        {['Request Status', 'Help & Support', 'Hostel / PG Finder', 'School Search'].map((item) => (
          <Pressable key={item} onPress={() => openModule(item)} style={styles.availableItem}>
            <Text style={styles.availableItemText}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )

  const renderUnlinkedMode = () => (
    <View style={styles.sectionBlock}>
      <View style={[styles.panelCard, styles.awaitingBanner]}>
        <Text style={styles.awaitingTitle}>No linked school found</Text>
        <Text style={styles.awaitingText}>
          Search school globally or register child to send access request.
        </Text>
      </View>
      <View style={styles.actionRow}>
        <Button variant="primary" onPress={() => openModule('Search School (Global)')} style={styles.flexButton}>
          Search School
        </Button>
        <Button variant="outline" onPress={() => openModule('Add / Link Child')} style={styles.flexButton}>
          Register Child
        </Button>
      </View>
    </View>
  )

  return (
    <View style={styles.screen}>
      <View style={[styles.stickyHeader, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={[styles.headerTop, compactHeader && styles.headerTopCompact]}>
          {linkedMode ? (
            <Pressable
              onPress={() => {
                setChildSelectorOpen(true)
                auditEvent('CHILD_SELECTOR_OPENED')
              }}
              style={styles.childIdentity}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{activeChild?.name?.slice(0, 1) || 'C'}</Text>
              </View>
              <View style={styles.identityTextWrap}>
                <Text style={styles.identityName} numberOfLines={1}>
                  {activeChild?.name}
                </Text>
                <Text style={styles.identitySub} numberOfLines={1}>
                  {activeChild?.classLabel} • {activeChild?.branch}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.childIdentity}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>P</Text>
              </View>
              <View style={styles.identityTextWrap}>
                <Text style={styles.identityName} numberOfLines={1}>
                  {session.parentName}
                </Text>
                <Text style={styles.identitySub} numberOfLines={1}>
                  {session.mobile}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.headerPills, compactHeader && styles.headerPillsCompact]}>
            <Pressable
              onPress={() => auditEvent('SAFETY_PILL_OPENED')}
              style={[styles.statusPill, getSafetyTone(activeChild?.safety || 'Attention')]}
            >
              <Text style={styles.statusPillText}>{pendingMode ? 'Awaiting Approval' : activeChild?.safety || 'Attention'}</Text>
            </Pressable>
            {linkedMode ? (
              <Pressable
                onPress={() => auditEvent('SUBSCRIPTION_BADGE_OPENED')}
                style={styles.subscriptionPill}
              >
                <Text style={styles.subscriptionText}>{activeChild?.subscription || 'Active'}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => {
                setActiveModule('Notification Center')
                auditEvent('NOTIFICATION_CENTER_OPENED')
              }}
              style={styles.iconPill}
            >
              <Text style={styles.iconText}>🔔</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMoreOpen(true)
                auditEvent('SIDEBAR_OPENED')
              }}
              style={styles.iconPill}
            >
              <Text style={styles.iconText}>⋮</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <StackSafeScrollView>
        <View style={styles.screenTitleWrap}>
          <Text style={styles.screenTitle}>Parent + Student Unified Panel</Text>
          <Text style={styles.screenSubtitle}>
            S-TRAX safety + tracking + ERP snapshot with multi-child context.
          </Text>
        </View>

        {pendingMode ? renderLimitedMode() : null}
        {unlinkedMode ? renderUnlinkedMode() : null}

        {linkedMode ? (
          <View style={styles.sectionBlock}>
            {DASHBOARD_CARDS.map((cardItem) => (
              <Pressable
                key={cardItem.key}
                onPress={() => {
                  openModule(cardItem.module)
                  auditEvent('CARD_OPENED', { card: cardItem.key })
                }}
                style={[styles.panelCard, styles.cardPress]}
              >
                <Text style={styles.cardTitle}>{cardItem.title}</Text>
                <Text style={styles.cardSummary}>{cardItem.summary}</Text>
                <View style={styles.cardFooterRow}>
                  <View style={[styles.statusDot, getCardStatusStyle(cardItem.status)]} />
                  <Text style={styles.cardFooterText}>Tap to open {cardItem.module}</Text>
                </View>
              </Pressable>
            ))}

            <View style={styles.panelCard}>
              <Text style={styles.sectionTitle}>Alerts & Notifications Feed</Text>
              {ALERTS_FEED.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => auditEvent('ALERT_CLICKED', { item })}
                  style={styles.feedRow}
                >
                  <View style={styles.feedDot} />
                  <Text style={styles.feedText}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.panelCard}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {QUICK_ACTIONS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      openModule(item)
                      auditEvent('QUICK_ACTION_USED', { action: item })
                    }}
                    style={styles.quickActionItem}
                  >
                    <Text style={styles.quickActionText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {activeModule !== 'Dashboard' ? (
          <View style={[styles.panelCard, styles.modulePreview]}>
            <Text style={styles.sectionTitle}>{activeModule}</Text>
            <Text style={styles.cardSummary}>
              Module scaffold open. Child context, permission checks, subscription gates and audit
              hooks are wired from unified panel shell.
            </Text>
          </View>
        ) : null}
      </StackSafeScrollView>

      <Modal visible={childSelectorOpen} animationType="slide" transparent onRequestClose={() => setChildSelectorOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setChildSelectorOpen(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <Text style={styles.bottomSheetTitle}>Select Child</Text>
            <ScrollView style={styles.bottomSheetList}>
              {(session.linkedChildren || []).map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() => switchChild(child.id)}
                  style={[
                    styles.childRow,
                    session.activeChildId === child.id && styles.childRowActive,
                  ]}
                >
                  <Text style={styles.childRowName}>{child.name}</Text>
                  <Text style={styles.childRowMeta}>
                    {child.classLabel} • {child.branch} • {child.trackingLastUpdate}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.childActions}>
              <Button variant="outline" style={styles.flexButton} onPress={() => openModule('Add / Link Child')}>
                Add Child
              </Button>
              <Button variant="outline" style={styles.flexButton} onPress={() => openModule('Search School (Global)')}>
                Search School
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={moreOpen} animationType="fade" transparent onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMoreOpen(false)}>
          <Pressable style={styles.morePanel} onPress={() => {}}>
            <Text style={styles.bottomSheetTitle}>More</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MENU_GROUPS.map((group) => (
                <View key={group.title} style={styles.menuGroup}>
                  <Text style={styles.menuGroupTitle}>{group.title}</Text>
                  {group.items.map((item) => {
                    const locked = isLockedItem({ mode: session.mode, item, activeChild })
                    return (
                      <Pressable
                        key={item}
                        onPress={() => {
                          if (item === 'Logout') {
                            auditEvent('LOGOUT')
                            onLogout?.()
                            return
                          }
                          openModule(item)
                        }}
                        style={[styles.menuItem, locked && styles.menuItemLocked]}
                      >
                        <Text style={[styles.menuItemText, locked && styles.menuItemTextLocked]}>
                          {item}
                        </Text>
                        <Text style={styles.menuArrow}>
                          {locked ? 'Locked' : '>'}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: background,
  },
  stickyHeader: {
    borderBottomWidth: 1,
    borderBottomColor: border,
    backgroundColor: 'rgba(23,40,69,0.98)',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerTopCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  childIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.5)',
    backgroundColor: 'rgba(96,165,250,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 15,
  },
  identityTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  identityName: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 14,
  },
  identitySub: {
    color: textMuted,
    marginTop: 2,
    fontWeight: '700',
    fontSize: 11,
  },
  headerPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerPillsCompact: {
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillText: {
    fontWeight: '900',
    fontSize: 11,
    color: textPrimary,
  },
  pillSafe: {
    backgroundColor: 'rgba(16,185,129,0.22)',
  },
  pillAttention: {
    backgroundColor: 'rgba(245,158,11,0.24)',
  },
  pillAlert: {
    backgroundColor: 'rgba(239,68,68,0.24)',
  },
  subscriptionPill: {
    backgroundColor: 'rgba(96,165,250,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  subscriptionText: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 11,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 14,
  },
  screenTitleWrap: {
    marginTop: 8,
    marginBottom: 4,
  },
  screenTitle: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 18,
  },
  screenSubtitle: {
    color: textMuted,
    marginTop: 4,
    fontWeight: '700',
    fontSize: 12,
  },
  sectionBlock: {
    gap: 10,
  },
  panelCard: {
    backgroundColor: card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: border,
    padding: 12,
  },
  cardPress: {
    gap: 8,
  },
  cardTitle: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 14,
  },
  cardSummary: {
    color: textSecondary,
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 18,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusHealthy: {
    backgroundColor: success,
  },
  statusAttention: {
    backgroundColor: warning,
  },
  statusCritical: {
    backgroundColor: danger,
  },
  cardFooterText: {
    color: textMuted,
    fontWeight: '700',
    fontSize: 11,
  },
  sectionTitle: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 8,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  feedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: primary,
  },
  feedText: {
    flex: 1,
    color: textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionItem: {
    minWidth: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  quickActionText: {
    color: textPrimary,
    fontWeight: '800',
    fontSize: 12,
  },
  awaitingBanner: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.38)',
  },
  awaitingTitle: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 6,
  },
  awaitingText: {
    color: textSecondary,
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 18,
  },
  availableItem: {
    borderWidth: 1,
    borderColor: border,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
  },
  availableItemText: {
    color: textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flexButton: {
    flex: 1,
  },
  modulePreview: {
    marginTop: 4,
    marginBottom: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.65)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    maxHeight: '66%',
    backgroundColor: 'rgba(23,40,69,0.98)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: border,
    padding: 12,
  },
  bottomSheetTitle: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 10,
  },
  bottomSheetList: {
    maxHeight: 260,
  },
  childRow: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  childRowActive: {
    borderColor: 'rgba(250,204,21,0.62)',
    backgroundColor: 'rgba(250,204,21,0.15)',
  },
  childRowName: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 13,
  },
  childRowMeta: {
    color: textSecondary,
    marginTop: 4,
    fontWeight: '700',
    fontSize: 11,
  },
  childActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  morePanel: {
    marginTop: 70,
    marginHorizontal: 10,
    marginBottom: 20,
    backgroundColor: 'rgba(23,40,69,0.98)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: border,
    padding: 12,
    maxHeight: '84%',
  },
  menuGroup: {
    marginBottom: 10,
  },
  menuGroupTitle: {
    color: textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  menuItem: {
    borderWidth: 1,
    borderColor: border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLocked: {
    borderColor: 'rgba(245,158,11,0.45)',
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  menuItemText: {
    color: textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  menuItemTextLocked: {
    color: '#FCD34D',
  },
  menuArrow: {
    color: textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
})

