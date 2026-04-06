import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { textPrimary, textSecondary, radius } from '../../theme/colors'
import { TabSafeScrollView } from '../../components/common/SafeScrollView'
import AppHeader from '../../components/common/AppHeader'
import Badge from '../../components/common/Badge'
import { mockAttendance } from '../../utils/mockData'
import useResponsiveLayout from '../../hooks/useResponsiveLayout'

export default function AttendanceScreen() {
  const tabBarHeight = useBottomTabBarHeight()
  const layout = useResponsiveLayout({ tabBarHeight })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectedDay = useMemo(() => mockAttendance.calendar.days[selectedIndex] || mockAttendance.calendar.days[0], [selectedIndex])

  const statusTone = (status) => {
    if (status === 'Present') return 'success'
    if (status === 'Late') return 'warning'
    if (status === 'Absent') return 'danger'
    return 'neutral'
  }

  const daySize = layout.isCompact ? 38 : layout.width < 400 ? 40 : 44

  return (
    <TabSafeScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Attendance" subtitle={`Selected: ${selectedDay} · ${mockAttendance.calendar.monthLabel}`} />

      <View style={styles.calendarCard}>
        <Text style={styles.calendarLabel}>{mockAttendance.calendar.monthLabel}</Text>
        <View style={[styles.daysRow, { gap: layout.gap }]}>
          {mockAttendance.calendar.days.map((d, idx) => {
            const active = idx === selectedIndex
            return (
              <TouchableOpacity
                key={`${d}_${idx}`}
                onPress={() => setSelectedIndex(idx)}
                style={[
                  styles.dayPill,
                  { width: daySize, height: daySize, borderRadius: daySize * 0.36 },
                  active ? styles.dayPillActive : null,
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.dayText, active ? styles.dayTextActive : null]}>{d}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.sectionTitle}>Today’s Attendance (UI)</Text>
        {mockAttendance.items.map((it) => (
          <View key={it.id} style={styles.itemRow}>
            <Badge tone={statusTone(it.status)}>{it.status}</Badge>
            <View style={styles.itemText}>
              <Text style={styles.itemDate}>{it.date}</Text>
              <Text style={styles.itemDetail}>{it.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </TabSafeScrollView>
  )
}

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    padding: 16,
  },
  calendarLabel: {
    color: textSecondary,
    fontWeight: '900',
    fontSize: 12,
  },
  daysRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayPill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  dayPillActive: {
    borderColor: 'rgba(37,99,235,0.55)',
    backgroundColor: 'rgba(37,99,235,0.12)',
  },
  dayText: { color: textSecondary, fontWeight: '900' },
  dayTextActive: { color: textPrimary },
  listCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    padding: 16,
  },
  sectionTitle: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  itemText: { flex: 1, minWidth: 0 },
  itemDate: { color: textPrimary, fontWeight: '800' },
  itemDetail: { marginTop: 4, color: textSecondary, fontWeight: '700', fontSize: 12 },
})

