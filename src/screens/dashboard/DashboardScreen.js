/**
 * DashboardScreen.js
 * ─────────────────────────────────────────────────────────────
 * Premium STRAX Parent Dashboard with GlobalHeader integration.
 */

import React, { useEffect, useCallback, useRef, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, Animated,
  Pressable, RefreshControl, Image,
} from 'react-native'
import {
  background, surface, border, card,
  primary, primaryLight,
  success, warning, danger, successLight, warningLight, dangerLight,
  textPrimary, textSecondary, textMuted,
  radius, spacing, layout,
} from '../../theme/colors'
import { fontSizes, fontWeights } from '../../theme/typography'
import { entrance, durations } from '../../theme/motion'
import { useSession } from '../../context/SessionContext'
import { parentGet, API_BASE } from '../../utils/api'
import { shadows } from '../../theme/shadows'

import GlobalHeader     from '../../components/navigation/GlobalHeader'
import StatCard         from '../../components/cards/StatCard'
import FeeCard          from '../../components/cards/FeeCard'
import SkeletonCard     from '../../components/feedback/SkeletonCard'
import SectionHeader    from '../../components/primitives/SectionHeader'
import AnimatedButton   from '../../components/primitives/AnimatedButton'

import { TabSafeScrollView } from '../../components/common/SafeScrollView'

export default function DashboardScreen({ navigation }) {
  const {
    session, setChildren, setActiveChild,
    children: sessionChildren, parentName, logout,
    activeChild,
  } = useSession()

  const [allChildren, setAllChildren]   = useState(sessionChildren || [])
  const [dashData,    setDashData]      = useState(null)
  const [loading,     setLoading]       = useState(true)
  const [refreshing,  setRefreshing]    = useState(false)

  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    entrance(fadeAnim, slideAnim, 20, durations.normal).start()
  }, [])

  // ── Fetch linked children from backend on mount ──────────────
  const loadChildren = async () => {
    try {
      const res = await parentGet('/children')
      const kids = res.children || []
      setAllChildren(kids)
      await setChildren(kids)
      if (kids.length > 0) {
        if (!activeChild || !kids.find(k => k.student_id === activeChild.student_id)) {
          setActiveChild(kids[0])
        }
      }
    } catch (err) {
      console.warn('[Dashboard] /children failed:', err.message)
      setAllChildren(sessionChildren || [])
    }
  }

  useEffect(() => {
    loadChildren()
  }, [])

  // ── Fetch dashboard summary for active child ─────────────────
  const fetchDashboard = useCallback(async (isRefresh = false, childOverride = null) => {
    const child = childOverride || activeChild || allChildren[0] || null
    if (!child?.student_id) {
      setLoading(false)
      setRefreshing(false)
      return
    }

    if (isRefresh) setRefreshing(true)
    else           setLoading(true)

    try {
      const [resSummary, resAcademic] = await Promise.all([
        parentGet(`/dashboard/summary?student_id=${child.student_id}&group_id=${child.group_id}`),
        parentGet(`/academic-summary?student_id=${child.student_id}&group_id=${child.group_id}`).catch(() => ({ timetable: [] }))
      ])

      const s = resSummary.summary || resSummary
      setDashData({
        childName:   s.full_name  || `${s.first_name || ''} ${s.last_name || ''}`.trim() || child.full_name || 'Student',
        className:   s.class_name   || child.class_name   || '—',
        sectionName: s.section_name || child.section_name || '—',
        branchName:  s.branch_name  || child.branch_name  || child.school_name || '—',
        todayAttendance: (s.today_attendance || 'N/A').toUpperCase(),
        homeworkCount:   Number(s.homework_count) || 0,
        feeDue:          Number(s.fee_due)         || 0,
        feeDueDate:      s.fee_due_date            || null,
        feeOverdue:      !!s.fee_overdue,
        photoUrl:        s.documents_photo_url || child.photo_url || null,
        admissionNo:     s.admission_no            || child.admission_number || null,
        classesToday:    resAcademic?.timetable || [],
        homeworkPending: resAcademic?.homework_pending || [],
      })
    } catch (err) {
      console.warn('[Dashboard] summary fetch failed:', err.message)
      setDashData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeChild, allChildren])

  // Re-fetch when active child changes
  useEffect(() => {
    if (activeChild?.student_id || allChildren.length > 0) {
      fetchDashboard()
    } else {
      setLoading(false)
    }
  }, [activeChild?.student_id, allChildren.length])

  const navigateTab = useCallback((tab) => navigation.navigate(tab), [navigation])

  // ── Skeleton ────────────────────────────────────────────────
  if (loading && !dashData) {
    return (
      <View style={{ flex: 1, backgroundColor: background }}>
        <GlobalHeader />
        <TabSafeScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonHeader}>
            <SkeletonCard height={20} style={{ width: '40%' }} />
            <SkeletonCard height={14} style={{ width: '60%', marginTop: 8 }} />
          </View>
          <SkeletonCard height={80} style={styles.sectionGap} />
          <View style={[styles.statsRow, styles.sectionGap]}>
            <SkeletonCard height={90} style={{ flex: 1 }} />
            <SkeletonCard height={90} style={{ flex: 1 }} />
            <SkeletonCard height={90} style={{ flex: 1 }} />
          </View>
        </TabSafeScrollView>
      </View>
    )
  }

  const hasChildren = allChildren.length > 0
  const currentChild = activeChild || allChildren[0] || null

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <GlobalHeader />

      <TabSafeScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              loadChildren()
              fetchDashboard(true)
            }}
            tintColor={primary}
            colors={[primary]}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── No Children Linked Banner ── */}
          {!hasChildren ? (
            <View style={styles.sectionGap}>
              <Pressable
                style={[styles.linkBanner, shadows.glow]}
                onPress={() => navigation.navigate('LinkChild')}
              >
                <Text style={styles.bannerEmoji}>🔍</Text>
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>No Students Linked</Text>
                  <Text style={styles.bannerSub}>Tap to submit a linking request to the school</Text>
                </View>
                <Text style={styles.bannerArrow}>➔</Text>
              </Pressable>
            </View>
          ) : null}

          {/* ── Student Active Card ── */}
          {dashData && currentChild ? (
            <View style={styles.sectionGap}>
              <View style={styles.childInfoCard}>
                <View style={styles.childInfoRow}>
                  <View style={[styles.childInfoAvatar, { overflow: 'hidden' }]}>
                    {dashData.photoUrl ? (
                      <Image source={{ uri: `${API_BASE}${dashData.photoUrl}` }} style={styles.childInfoAvatarImage} />
                    ) : (
                      <Text style={styles.childInfoAvatarText}>
                        {(dashData.childName || 'S')[0].toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.childInfoName}>{dashData.childName}</Text>
                    <Text style={styles.childInfoSub}>
                      {dashData.className}{dashData.sectionName ? ` · ${dashData.sectionName}` : ''} · {dashData.branchName}
                    </Text>
                    {dashData.admissionNo ? (
                      <Text style={styles.childInfoAdm}>Adm: {dashData.admissionNo}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {/* ── Stats Row ── */}
          {hasChildren ? (
            <View style={styles.sectionGap}>
              <SectionHeader title="Today's Overview" />
              <View style={styles.statsRow}>
                <StatCard
                  icon="🎓"
                  label="Attendance"
                  value={dashData ? (dashData.todayAttendance === 'PRESENT' ? 'Present' : dashData.todayAttendance === 'ABSENT' ? 'Absent' : 'N/A') : '—'}
                  accentColor={
                    dashData?.todayAttendance === 'PRESENT' ? success :
                    dashData?.todayAttendance === 'ABSENT'  ? danger  : warning
                  }
                  style={{ flex: 1 }}
                />
                <StatCard
                  icon="📚"
                  label="Homework"
                  value={dashData ? `${dashData.homeworkCount} pending` : '—'}
                  accentColor={primary}
                  style={{ flex: 1 }}
                />
                <StatCard
                  icon="💳"
                  label="Fees Due"
                  value={
                    !dashData ? '—' :
                    dashData.feeDue > 0
                      ? `₹${Number(dashData.feeDue).toLocaleString('en-IN')}`
                      : 'Clear'
                  }
                  accentColor={
                    dashData?.feeOverdue  ? danger  :
                    dashData?.feeDue > 0  ? warning : success
                  }
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : null}

          {/* ── Today's Schedule Snapshot (Timetable list on dashboard) ── */}
          {hasChildren ? (
            <View style={styles.sectionGap}>
              <SectionHeader title="Today's Classes" subtitle="Timetable schedule" />
              {dashData?.classesToday?.length > 0 ? (
                dashData.classesToday.slice(0, 3).map((period, i) => (
                  <View key={i} style={styles.classCardItem}>
                    <View>
                      <Text style={styles.classSubject}>{period.subject_name}</Text>
                      <Text style={styles.classTeacher}>Teacher: {period.teacher_name || 'Not assigned'}</Text>
                    </View>
                    <View style={styles.classTimeTag}>
                      <Text style={styles.classTimeText}>{period.start_time.slice(0, 5)} - {period.end_time.slice(0, 5)}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyTimetable}>
                  <Text style={styles.emptyText}>No classes scheduled or recorded for today.</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* ── Active Homework Snapshot ── */}
          {hasChildren ? (
            <View style={styles.sectionGap}>
              <SectionHeader title="Homework Tasks" subtitle="Pending assignments" />
              {dashData?.homeworkPending?.length > 0 ? (
                dashData.homeworkPending.slice(0, 2).map((hw, i) => (
                  <Pressable
                    key={hw.id || i}
                    style={[styles.classCardItem, { borderLeftColor: warning }]}
                    onPress={() => navigateTab('Academics')}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.classSubject}>{hw.title}</Text>
                      <Text style={styles.classTeacher}>{hw.subject_name} · Due: {new Date(hw.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                    </View>
                    <Text style={{ fontSize: fontSizes.body, color: warning }}>➔</Text>
                  </Pressable>
                ))
              ) : (
                <View style={styles.emptyTimetable}>
                  <Text style={styles.emptyText}>All clean! No pending homework tasks.</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* ── Fee Due Card ── */}
          {dashData?.feeDue > 0 ? (
            <View style={styles.sectionGap}>
              <FeeCard
                fee={{
                  feeName:    dashData.feeOverdue ? 'Overdue Fee' : 'Fee Due',
                  amount:     dashData.feeDue,
                  paidAmount: 0,
                  status:     dashData.feeOverdue ? 'OVERDUE' : 'PENDING',
                  dueDate:    dashData.feeDueDate,
                }}
                onPress={() => navigateTab('Payments')}
              />
            </View>
          ) : null}

          {/* ── Quick Actions ── */}
          <View style={styles.sectionGap}>
            <SectionHeader title="Quick Access" />
            <View style={styles.actionsGrid}>
              {[
                { key: 'Academics', emoji: '📊', label: 'Attendance', tab: 'Academics' },
                { key: 'Payments',  emoji: '💳', label: 'Fees',       tab: 'Payments'  },
                { key: 'Transport', emoji: '🚌', label: 'Bus',        tab: 'Transport' },
                { key: 'PTM',       emoji: '📣', label: 'PTM',        tab: 'ParentPTMList' },
                { key: 'Profile',   emoji: '👤', label: 'Profile',    tab: 'Profile'   },
              ].map((action) => (
                <Pressable
                  key={action.key}
                  style={styles.actionBtn}
                  onPress={() => navigateTab(action.tab)}
                >
                  <View style={styles.actionIcon}>
                    <Text style={styles.actionEmoji}>{action.emoji}</Text>
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Sign Out ── */}
          <View style={[styles.sectionGap, { alignItems: 'center', paddingBottom: spacing.md }]}>
            <AnimatedButton variant="ghost" size="sm" onPress={logout}>
              Sign Out
            </AnimatedButton>
          </View>

          <View style={{ height: spacing.xxxl }} />
        </Animated.View>
      </TabSafeScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  // Section spacing
  sectionGap: {
    paddingHorizontal: layout.screenPaddingH,
    marginTop:         spacing.md,
  },

  // Link banner
  linkBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: primary + '12',
    borderRadius:    radius.xl,
    borderWidth:     1.5,
    borderColor:     primary + '30',
    padding:         spacing.md,
    gap:             spacing.md,
  },
  bannerEmoji: { fontSize: 28 },
  bannerText:  { flex: 1 },
  bannerTitle: { color: textPrimary,   fontSize: fontSizes.body, fontWeight: fontWeights.bold },
  bannerSub:   { color: textSecondary, fontSize: fontSizes.caption, marginTop: 2 },
  bannerArrow: { color: primary,       fontSize: fontSizes.body, fontWeight: fontWeights.black },

  // Child info card
  childInfoCard: {
    backgroundColor: card,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.md,
  },
  childInfoRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  childInfoAvatar:    {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  childInfoAvatarImage: {
    width:      52,
    height:     52,
    borderRadius: 26,
  },
  childInfoAvatarText: { color: primary, fontSize: fontSizes.h3, fontWeight: fontWeights.black },
  childInfoName:  { color: textPrimary,   fontSize: fontSizes.body, fontWeight: fontWeights.bold },
  childInfoSub:   { color: textSecondary, fontSize: fontSizes.caption, marginTop: 2 },
  childInfoAdm:   { color: textMuted,     fontSize: fontSizes.caption, marginTop: 2 },

  // Stats row
  statsRow: { flexDirection: 'row', gap: spacing.sm },

  // Class card items (Today's classes)
  classCardItem: {
    backgroundColor: card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: border,
    borderLeftWidth: 4,
    borderLeftColor: primary,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  classSubject: {
    color: textPrimary,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  classTeacher: {
    color: textMuted,
    fontSize: fontSizes.caption,
    marginTop: 2,
  },
  classTimeTag: {
    backgroundColor: surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: border,
  },
  classTimeText: {
    color: primary,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.extrabold,
  },
  emptyTimetable: {
    backgroundColor: surface,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: border,
    marginTop: spacing.sm,
  },
  emptyText: {
    color: textMuted,
    fontSize: fontSizes.caption,
    textAlign: 'center',
  },

  // Actions grid
  actionsGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            spacing.sm,
  },
  actionBtn: {
    width:           '18%',
    alignItems:      'center',
    gap:             spacing.xs,
  },
  actionIcon: {
    width:           54,
    height:          54,
    borderRadius:    radius.lg,
    backgroundColor: surface,
    borderWidth:     1,
    borderColor:     border,
    alignItems:      'center',
    justifyContent:  'center',
  },
  actionEmoji:  { fontSize: 24 },
  actionLabel:  { color: textMuted, fontSize: fontSizes.caption, textAlign: 'center' },

  // Skeleton
  skeletonHeader: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop:        spacing.xl,
  },
})
