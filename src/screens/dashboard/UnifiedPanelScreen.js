import React, { useMemo, useState, useEffect } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  background,
  border,
  card,
  danger,
  primary,
  primaryLight,
  radius,
  success,
  textMuted,
  textPrimary,
  textSecondary,
  warning,
  secondary,
  spacing,
  surface,
} from '../../theme/colors'
import { StackSafeScrollView } from '../../components/common/SafeScrollView'
import Button from '../../components/common/Button'
import { auditEvent } from '../../utils/audit'
import { parentGet } from '../../utils/api'

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
    title: 'Support',
    items: ['Help & Support', 'FAQ', 'Documentation', 'Ticket', 'Live Chat'],
  },
  {
    title: 'Account',
    items: ['Settings', 'Add / Link Child', 'Logout'],
  },
]

function getSafetyTone(status) {
  if (status === 'ABSENT' || status === 'Alert') return styles.pillAlert
  if (status === 'LATE' || status === 'Attention') return styles.pillAttention
  return styles.pillSafe
}

export default function UnifiedPanelScreen({ session, onSessionUpdate, onLogout, onOpenModule }) {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const [moreOpen, setMoreOpen] = useState(false)
  const [childSelectorOpen, setChildSelectorOpen] = useState(false)
  const [activeModule, setActiveModule] = useState('Dashboard')
  
  // Real dynamic states
  const [children, setChildren] = useState([])
  const [activeChildId, setActiveChildId] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [mode, setMode] = useState('unlinked') // 'linked' | 'pending' | 'unlinked'

  const compactHeader = width < 390

  // 1. Fetch linked children on load
  const loadData = async () => {
    setLoading(true)
    try {
      // Get children
      const data = await parentGet('/children')
      const kids = data.children || []
      setChildren(kids)

      if (kids.length > 0) {
        setMode('linked')
        // Default to first child if not set
        const defaultChildId = activeChildId || kids[0].student_id
        setActiveChildId(defaultChildId)
        await loadDashboardSummary(defaultChildId, kids)
      } else {
        // Check manual requests to classify mode
        const reqData = await parentGet('/links/requests')
        const linkRequests = reqData.requests || []
        setRequests(linkRequests)
        if (linkRequests.length > 0) {
          setMode('pending')
        } else {
          setMode('unlinked')
        }
      }
    } catch (err) {
      console.warn('[UnifiedPanel] loadData error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto polling if in pending mode (approvals check)
  useEffect(() => {
    if (mode !== 'pending') return
    const interval = setInterval(() => {
      loadData()
    }, 15000)
    return () => clearInterval(interval)
  }, [mode])

  // 2. Fetch dashboard summary for active child
  const loadDashboardSummary = async (childId, currentKids = children) => {
    const child = currentKids.find((c) => c.student_id === childId)
    if (!child) return
    try {
      const sumRes = await parentGet(`/dashboard/summary?student_id=${child.student_id}&group_id=${child.group_id}`)
      setSummary(sumRes.summary)
    } catch (err) {
      console.warn('[UnifiedPanel] summary fetch warning:', err.message)
    }
  }

  const activeChild = useMemo(() => {
    if (!activeChildId) return null
    return children.find((c) => c.student_id === activeChildId) || null
  }, [activeChildId, children])

  const switchChild = async (childId) => {
    setActiveChildId(childId)
    setChildSelectorOpen(false)
    auditEvent('CHILD_CHANGED', { childId })
    await loadDashboardSummary(childId)
  }

  const openModule = (moduleName) => {
    setActiveModule(moduleName)
    auditEvent('MENU_ITEM_OPENED', { module: moduleName })
    setMoreOpen(false)

    const trackingModules = new Set(['Live Tracking', 'Tracking History', 'Geofence & Safe Zones', 'S-TRAX Devices'])
    const safetyModules = new Set(['Safety & Alerts', 'SOS Timeline'])
    const transportModules = new Set(['Transport / Bus Tracking'])

    if (trackingModules.has(moduleName)) {
      onOpenModule?.('tracking')
    } else if (safetyModules.has(moduleName)) {
      onOpenModule?.('safety')
    } else if (transportModules.has(moduleName)) {
      onOpenModule?.('transport')
    }
  }

  const renderLimitedMode = () => (
    <View style={styles.sectionBlock}>
      <View style={[styles.panelCard, styles.awaitingBanner]}>
        <Text style={styles.awaitingTitle}>Awaiting School Approval</Text>
        <Text style={styles.awaitingText}>
          Your link request is currently PENDING school verification.
          ERP dashboards and tracking will unlock as soon as your school approves the connection.
        </Text>
      </View>

      <View style={styles.panelCard}>
        <Text style={styles.sectionTitle}>Manual Link Requests</Text>
        {requests.map((req) => (
          <View key={req.id} style={styles.availableItem}>
            <View style={styles.reqHeader}>
              <Text style={styles.availableItemText}>{req.student_name}</Text>
              <Text style={[
                styles.statusBadgeText,
                req.status === 'APPROVED' ? styles.successColor : styles.warningColor
              ]}>
                {req.status}
              </Text>
            </View>
            <Text style={styles.reqMeta}>Adm: {req.admission_number} • {req.school_name}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderUnlinkedMode = () => (
    <View style={styles.sectionBlock}>
      <View style={[styles.panelCard, styles.awaitingBanner]}>
        <Text style={styles.awaitingTitle}>No Linked Children</Text>
        <Text style={styles.awaitingText}>
          Your parent account is ready, but not linked to any school profiles yet.
          Submit an admission number to link.
        </Text>
      </View>
      <View style={styles.actionRow}>
        <Button variant="primary" onPress={() => openModule('Add / Link Child')} style={styles.flexButton}>
          Link Child Profile
        </Button>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.loadingText}>Loading Child Profile...</Text>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      {/* ── Sticky Header ── */}
      <View style={[styles.stickyHeader, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={[styles.headerTop, compactHeader && styles.headerTopCompact]}>
          {mode === 'linked' && activeChild ? (
            <Pressable
              onPress={() => {
                setChildSelectorOpen(true)
                auditEvent('CHILD_SELECTOR_OPENED')
              }}
              style={styles.childIdentity}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{activeChild.first_name?.slice(0, 1) || 'C'}</Text>
              </View>
              <View style={styles.identityTextWrap}>
                <Text style={styles.identityName} numberOfLines={1}>
                  {activeChild.full_name}
                </Text>
                <Text style={styles.identitySub} numberOfLines={1}>
                  {activeChild.class_name} - {activeChild.section_name} • {activeChild.school_name}
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
                  Parent Account
                </Text>
                <Text style={styles.identitySub} numberOfLines={1}>
                  {session.user?.phone || 'Online'}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.headerPills, compactHeader && styles.headerPillsCompact]}>
            {mode === 'linked' && summary ? (
              <Pressable
                onPress={() => auditEvent('SAFETY_PILL_OPENED')}
                style={[styles.statusPill, getSafetyTone(summary.today_attendance)]}
              >
                <Text style={styles.statusPillText}>
                  {summary.today_attendance || 'NO ATTENDANCE'}
                </Text>
              </Pressable>
            ) : mode === 'pending' ? (
              <View style={[styles.statusPill, styles.pillAttention]}>
                <Text style={styles.statusPillText}>Awaiting Approval</Text>
              </View>
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
          <Text style={styles.screenTitle}>Parent Unified Panel</Text>
          <Text style={styles.screenSubtitle}>
            S-TRAX ERP snapshot & safety monitoring.
          </Text>
        </View>

        {mode === 'pending' ? renderLimitedMode() : null}
        {mode === 'unlinked' ? renderUnlinkedMode() : null}

        {mode === 'linked' && activeChild && summary ? (
          <View style={styles.sectionBlock}>
            {/* Dynamic Dashboard Cards */}
            <Pressable
              onPress={() => openModule('Attendance')}
              style={[styles.panelCard, styles.cardPress]}
            >
              <Text style={styles.cardTitle}>RFID & Attendance</Text>
              <Text style={styles.cardSummary}>
                Today's Status: {summary.today_attendance ? `MARK ${summary.today_attendance}` : 'No punch records today'}
              </Text>
              <View style={styles.cardFooterRow}>
                <View style={[styles.statusDot, summary.today_attendance === 'PRESENT' ? styles.statusHealthy : styles.statusAttention]} />
                <Text style={styles.cardFooterText}>Tap to view history</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => openModule('Homework & Classroom')}
              style={[styles.panelCard, styles.cardPress]}
            >
              <Text style={styles.cardTitle}>Homework & Classroom</Text>
              <Text style={styles.cardSummary}>
                Active assignments: {summary.homework_count} pending
              </Text>
              <View style={styles.cardFooterRow}>
                <View style={[styles.statusDot, summary.homework_count > 0 ? styles.statusAttention : styles.statusHealthy]} />
                <Text style={styles.cardFooterText}>Tap to view classroom</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => openModule('Fees & Payments')}
              style={[styles.panelCard, styles.cardPress]}
            >
              <Text style={styles.cardTitle}>Outstanding Fees</Text>
              <Text style={styles.cardSummary}>
                Dues: {summary.fee_due > 0 ? `INR ${summary.fee_due}` : 'Fully Paid'}
                {summary.fee_due_date ? ` • Due: ${summary.fee_due_date.split('T')[0]}` : ''}
              </Text>
              <View style={styles.cardFooterRow}>
                <View style={[styles.statusDot, summary.fee_due > 0 ? styles.statusCritical : styles.statusHealthy]} />
                <Text style={styles.cardFooterText}>Pay Outstanding Fees</Text>
              </View>
            </Pressable>

            {/* Quick Actions */}
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
              Module preview scaffold. Real operational data is wired dynamically from the school server shard.
            </Text>
          </View>
        ) : null}
      </StackSafeScrollView>

      {/* Child Selector Modal */}
      <Modal visible={childSelectorOpen} animationType="slide" transparent onRequestClose={() => setChildSelectorOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setChildSelectorOpen(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <Text style={styles.bottomSheetTitle}>Select Child Profile</Text>
            <ScrollView style={styles.bottomSheetList}>
              {children.map((child) => (
                <Pressable
                  key={child.student_id}
                  onPress={() => switchChild(child.student_id)}
                  style={[
                    styles.childRow,
                    activeChildId === child.student_id && styles.childRowActive,
                  ]}
                >
                  <Text style={styles.childRowName}>{child.full_name}</Text>
                  <Text style={styles.childRowMeta}>
                    {child.class_name} - {child.section_name} • {child.school_name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.childActions}>
              <Button variant="outline" style={styles.flexButton} onPress={() => { setChildSelectorOpen(false); openModule('Add / Link Child') }}>
                Link Another Child
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* More Options Modal */}
      <Modal visible={moreOpen} animationType="fade" transparent onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMoreOpen(false)}>
          <Pressable style={styles.morePanel} onPress={() => {}}>
            <Text style={styles.bottomSheetTitle}>Menu Options</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MENU_GROUPS.map((group) => (
                <View key={group.title} style={styles.menuGroup}>
                  <Text style={styles.menuGroupTitle}>{group.title}</Text>
                  {group.items.map((item) => (
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
                      style={styles.menuItem}
                    >
                      <Text style={styles.menuItemText}>{item}</Text>
                      <Text style={styles.menuArrow}>&gt;</Text>
                    </Pressable>
                  ))}
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
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: background,
    gap: spacing.md,
  },
  loadingText: {
    color: textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  screen: {
    flex: 1,
    backgroundColor: background,
  },
  stickyHeader: {
    borderBottomWidth: 1,
    borderBottomColor: border,
    backgroundColor: card,
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
    borderColor: border,
    backgroundColor: surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: primary,
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
    backgroundColor: 'rgba(0,200,83,0.18)',
  },
  pillAttention: {
    backgroundColor: 'rgba(255,193,7,0.18)',
  },
  pillAlert: {
    backgroundColor: 'rgba(255,82,82,0.18)',
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: surface,
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
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
  },
  screenTitle: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 22,
  },
  screenSubtitle: {
    color: textMuted,
    marginTop: 4,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionBlock: {
    gap: 10,
    paddingHorizontal: 14,
  },
  panelCard: {
    backgroundColor: card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: border,
    padding: 14,
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
    backgroundColor: surface,
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
    backgroundColor: surface,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  quickActionText: {
    color: textPrimary,
    fontWeight: '800',
    fontSize: 12,
  },
  awaitingBanner: {
    backgroundColor: 'rgba(255,193,7,0.12)',
    borderColor: 'rgba(255,193,7,0.3)',
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
    backgroundColor: surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  successColor: { color: success },
  warningColor: { color: warning },
  reqMeta: {
    color: textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  availableItemText: {
    color: textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
  },
  flexButton: {
    flex: 1,
  },
  modulePreview: {
    marginTop: 8,
    marginBottom: 8,
    marginHorizontal: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.65)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    maxHeight: '66%',
    backgroundColor: card,
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
    backgroundColor: surface,
  },
  childRowActive: {
    borderColor: primary,
    backgroundColor: primaryLight,
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
    backgroundColor: card,
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
    backgroundColor: surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    color: textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  menuArrow: {
    color: textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
})
