/**
 * AttendanceScreen v2 — Premium attendance visualization.
 * AttendanceRing + monthly calendar heatmap + timeline list.
 * No tables. No ERP feel.
 */

import React, { useEffect, useCallback, useState, useRef } from 'react'
import {
  View, Text, ScrollView, StyleSheet, Animated,
  Pressable, RefreshControl,
} from 'react-native'
import {
  background, surface, card, border,
  primary, primaryLight, borderAccent,
  success, successLight,
  warning, warningLight,
  danger, dangerLight,
  textPrimary, textSecondary, textMuted,
  attendanceColors,
  radius, spacing, layout,
} from '../../theme/colors'
import { fontSizes, fontWeights } from '../../theme/typography'
import { entrance, durations } from '../../theme/motion'
import { useSession } from '../../context/SessionContext'
import { parentGet } from '../../utils/api'

import AttendanceRing  from '../../components/cards/AttendanceRing'
import SectionHeader   from '../../components/primitives/SectionHeader'
import SkeletonCard    from '../../components/feedback/SkeletonCard'
import ErrorState      from '../../components/feedback/ErrorState'
import EmptyState      from '../../components/feedback/EmptyState'

import { TabSafeScrollView } from '../../components/common/SafeScrollView'

const STATUS_META = {
  PRESENT: { label: 'Present', color: success, bg: successLight, emoji: '✓' },
  ABSENT:  { label: 'Absent',  color: danger,  bg: dangerLight,  emoji: '✗' },
  LATE:    { label: 'Late',    color: warning, bg: warningLight, emoji: '⏱' },
  LEAVE:   { label: 'Leave',   color: primary, bg: primaryLight,  emoji: '🏖' },
  HOLIDAY: { label: 'Holiday', color: textMuted, bg: surface,    emoji: '🎉' },
}

const MonthCalendar = ({ days = [] }) => {
  const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <View style={calStyles.wrap}>
      <View style={calStyles.header}>
        {DOW_LABELS.map((d, i) => (
          <Text key={i} style={calStyles.dow}>{d}</Text>
        ))}
      </View>
      <View style={calStyles.grid}>
        {days.map((day, i) => {
          const meta = STATUS_META[day.status] || {}
          return (
            <View
              key={i}
              style={[
                calStyles.dot,
                { backgroundColor: meta.color ? meta.color + '28' : surface,
                  borderColor:     meta.color ? meta.color + '50' : border },
              ]}
            >
              <Text style={[calStyles.dayNum, { color: meta.color || textMuted }]}>
                {day.day}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const calStyles = StyleSheet.create({
  wrap: {
    backgroundColor: card,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.md,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-around',
    marginBottom:   spacing.sm,
  },
  dow: {
    color:      textMuted,
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
    width:      36,
    textAlign:  'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           4,
  },
  dot: {
    width:          36,
    height:         36,
    borderRadius:   radius.sm,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
  },
})

export default function AttendanceScreen({ navigation }) {
  const { activeChild } = useSession()

  const [data,       setData]      = useState(null)
  const [loading,    setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error,      setError]     = useState(null)

  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    entrance(fadeAnim, slideAnim).start()
  }, [])

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!activeChild?.student_id) {
      setLoading(false)
      setRefreshing(false)
      return
    }
    if (isRefresh) setRefreshing(true)
    else           setLoading(true)
    setError(null)
    try {
      const res = await parentGet(
        `/academic-summary?student_id=${activeChild.student_id}&group_id=${activeChild.group_id}`
      )
      // res = { student, percentage, summary, homework_pending, records }
      // records[]: { date, status, remark, punch_in_time }
      const calDays = (res.records || []).map((r) => ({
        day:    new Date(r.date).getDate(),
        status: (r.status || 'PRESENT').toUpperCase(),
      }))

      setData({
        percentage: res.percentage || 0,
        summary:    res.summary || { present: 0, absent: 0, late: 0, leave: 0 },
        calendarDays: calDays,
        records: (res.records || []).map(r => ({
          date:   r.date,
          status: (r.status || 'PRESENT').toUpperCase(),
          remark: r.remark || r.punch_in_time
                  ? `Checked in at ${r.punch_in_time || 'school'}`
                  : null,
        })),
        monthLabel: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
        studentName: res.student?.name || activeChild.full_name || 'Student',
        className:   res.student?.class_name   || activeChild.class_name   || '',
        sectionName: res.student?.section_name || activeChild.section_name || '',
        homework_pending: res.homework_pending || [],
        timetable:   res.timetable || [],
        exams:       res.exams || [],
      })
    } catch (err) {
      console.warn('[Attendance] API failed:', err.message)
      setError('Could not load attendance data. Pull to refresh.')
      setData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeChild?.student_id, activeChild?.group_id])

  useEffect(() => {
    fetchData()
  }, [activeChild?.student_id])

  if (loading && !data) {
    return (
      <TabSafeScrollView showsVerticalScrollIndicator={false}>
        <SkeletonCard height={160} style={styles.section} />
        <SkeletonCard height={220} style={styles.section} />
        <SkeletonCard lines={5}    style={styles.section} />
      </TabSafeScrollView>
    )
  }

  if (error && !data) {
    return (
      <View style={styles.screen}>
        <ErrorState variant="apiError" message={error} onRetry={fetchData} />
      </View>
    )
  }

  const pct      = data?.percentage || 0
  const summary  = data?.summary || {}
  const calDays  = data?.calendarDays || []
  const records  = data?.records || []
  const timetable = data?.timetable || []
  const homework  = data?.homework_pending || []
  const exams     = data?.exams || []
  const month    = data?.monthLabel || new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <TabSafeScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={primary} colors={[primary]} />
      }
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        
        {/* ── Header ── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Academic Hub</Text>
          <Text style={styles.pageMonth}>{data?.studentName || 'Student'} · {data?.className} {data?.sectionName}</Text>
        </View>

        {/* ── 1. Today's Classes / Timetable ── */}
        <View style={styles.section}>
          <SectionHeader title="Today's Classes" subtitle="Timetable schedule" />
          {timetable.length > 0 ? (
            timetable.map((period, i) => (
              <View key={i} style={[styles.cardItem, { borderLeftColor: primary }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitleText}>{period.subject_name}</Text>
                  <Text style={styles.cardSubText}>Teacher: {period.teacher_name || 'Not assigned'}</Text>
                </View>
                <View style={styles.timeTag}>
                  <Text style={styles.timeTagText}>{period.start_time.slice(0, 5)} - {period.end_time.slice(0, 5)}</Text>
                </View>
              </View>
            ))
          ) : (
            <EmptyState emoji="⏰" title="No Classes Today" description="No classes scheduled for today." />
          )}
        </View>

        {/* ── 2. Homework & Assignments ── */}
        <View style={styles.section}>
          <SectionHeader title="Homework & Assignments" subtitle="Active tasks" />
          {homework.length > 0 ? (
            homework.map((hw, i) => (
              <Pressable
                key={i}
                style={[styles.cardItem, { borderLeftColor: warning }]}
                onPress={() => navigation.navigate('HomeworkDetail', { homework: hw, activeChild })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitleText}>{hw.title}</Text>
                  <Text style={styles.cardSubText}>{hw.subject_name} · {hw.description || 'No description provided'}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: warningLight, alignSelf: 'center' }]}>
                  <Text style={[styles.statusTagText, { color: warning }]}>Due: {new Date(hw.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <EmptyState emoji="📝" title="All Clean!" description="No pending homework tasks." />
          )}
        </View>

        {/* ── 3. Exams & Marks ── */}
        <View style={styles.section}>
          <SectionHeader title="Exams & Reports" subtitle="Performance overview" />
          {exams.length > 0 ? (
            exams.map((ex, i) => (
              <View key={i} style={[styles.cardItem, { borderLeftColor: success }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitleText}>{ex.exam_name}</Text>
                  <Text style={styles.cardSubText}>{ex.subject_name} · Date: {new Date(ex.exam_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.marksText}>{ex.marks_obtained !== null ? `${ex.marks_obtained}/${ex.max_marks}` : 'Awaiting Marks'}</Text>
                  <Text style={styles.marksLabel}>{ex.marks_obtained !== null ? 'Scored' : 'Not Graded'}</Text>
                </View>
              </View>
            ))
          ) : (
            <EmptyState emoji="🏆" title="No Exams Scheduled" description="Exam dates will appear here when scheduled." />
          )}
        </View>

        {/* ── 4. Attendance Ring + Summary ── */}
        <View style={styles.section}>
          <SectionHeader title="Attendance Record" subtitle="Overall stats" />
          <View style={[styles.ringCard]}>
            <AttendanceRing percentage={pct} size={110} />
            <View style={styles.summaryGrid}>
              {[
                { label: 'Present', value: summary.present, color: success },
                { label: 'Absent',  value: summary.absent,  color: danger  },
                { label: 'Late',    value: summary.late,    color: warning },
                { label: 'Leave',   value: summary.leave,   color: primary },
              ].map((s) => (
                <View key={s.label} style={[styles.summaryCell, { backgroundColor: s.color + '14' }]}>
                  <Text style={[styles.summaryVal, { color: s.color }]}>{s.value ?? '0'}</Text>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Calendar Heatmap ── */}
        {calDays.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Monthly Calendar View" />
            <MonthCalendar days={calDays} />
          </View>
        ) : null}

        {/* ── Record Timeline ── */}
        <View style={styles.section}>
          <SectionHeader title="Daily Check-in Records" />
          {records.length > 0 ? (
            records.map((rec, i) => {
              const meta = STATUS_META[rec.status] || STATUS_META.PRESENT
              return (
                <View key={i} style={[styles.timelineItem, i > 0 && { marginTop: spacing.md }]}>
                  <View style={[styles.timelineDot, { backgroundColor: meta.color }]}>
                    <Text style={styles.timelineEmoji}>{meta.emoji}</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineDate}>
                      {rec.date ? new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }) : '—'}
                    </Text>
                    <View style={[styles.statusTag, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.statusTagText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    {rec.remark ? (
                      <Text style={styles.remark}>{rec.remark}</Text>
                    ) : null}
                  </View>
                </View>
              )
            })
          ) : (
            <EmptyState
              emoji="📋"
              title="No Records"
              description="Attendance records will appear here."
            />
          )}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </Animated.View>
    </TabSafeScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: background,
  },
  scroll: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop:        spacing.xl,
  },
  section: {
    marginTop: layout.sectionGap,
  },
  pageHeader: {
    gap: 4,
  },
  pageTitle: {
    color:      textPrimary,
    fontSize:   fontSizes.h2,
    fontWeight: fontWeights.black,
  },
  pageMonth: {
    color:    textMuted,
    fontSize: fontSizes.sub,
  },
  ringCard: {
    backgroundColor: card,
    borderRadius:    radius.xxl,
    borderWidth:     1,
    borderColor:     border,
    padding:         spacing.xl,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.lg,
  },
  summaryGrid: {
    flex:       1,
    flexWrap:   'wrap',
    flexDirection: 'row',
    gap:         spacing.sm,
  },
  summaryCell: {
    width:          '45%',
    borderRadius:   radius.md,
    padding:        spacing.sm,
    alignItems:     'center',
  },
  summaryVal: {
    fontSize:   fontSizes.h3,
    fontWeight: fontWeights.black,
  },
  summaryLabel: {
    color:      textMuted,
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineItem: {
    flexDirection: 'row',
    gap:           spacing.md,
    alignItems:    'flex-start',
  },
  timelineDot: {
    width:           36,
    height:          36,
    borderRadius:    18,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  timelineEmoji: {
    fontSize: 14,
    color:    '#fff',
  },
  timelineContent: {
    flex: 1,
    gap:  4,
  },
  timelineDate: {
    color:      textPrimary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  statusTag: {
    alignSelf:         'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.round,
  },
  statusTagText: {
    fontSize:      fontSizes.caption,
    fontWeight:    fontWeights.extrabold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remark: {
    color:    textMuted,
    fontSize: fontSizes.caption,
  },
  cardItem: {
    backgroundColor: card,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     border,
    borderLeftWidth: 4,
    padding:         spacing.md,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.md,
    marginTop:       spacing.sm,
  },
  cardTitleText: {
    color:      textPrimary,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  cardSubText: {
    color:      textMuted,
    fontSize:   fontSizes.caption,
    marginTop:  2,
  },
  timeTag: {
    backgroundColor: surface,
    paddingHorizontal: spacing.sm,
    paddingVertical:   4,
    borderRadius:      radius.md,
    borderWidth:       1,
    borderColor:       border,
  },
  timeTagText: {
    color:      primary,
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.extrabold,
  },
  marksText: {
    color:      success,
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.black,
  },
  marksLabel: {
    color:      textMuted,
    fontSize:   fontSizes.caption,
    fontWeight: fontWeights.bold,
    marginTop:  2,
  },
})
