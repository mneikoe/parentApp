import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { textPrimary, textSecondary, radius } from '../../theme/colors'
import { TabSafeScrollView } from '../../components/common/SafeScrollView'
import AppHeader from '../../components/common/AppHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import StudentCard from '../../components/cards/StudentCard'
import AttendanceCard from '../../components/cards/AttendanceCard'
import FeeCard from '../../components/cards/FeeCard'
import SOSCard from '../../components/cards/SOSCard'
import { mockChild, mockDashboard } from '../../utils/mockData'
import useResponsiveLayout from '../../hooks/useResponsiveLayout'

const STATS = [
  { key: 'att', title: 'Attendance Today', valueKey: 'attendanceToday', tone: 'success' },
  { key: 'fee', title: 'Fees Due', valueKey: 'feesDue', tone: 'warning' },
  { key: 'hw', title: 'Homework Pending', valueKey: 'homeworkPending', tone: 'primary' },
]

export default function DashboardScreen({ navigation }) {
  const tabBarHeight = useBottomTabBarHeight()
  const layout = useResponsiveLayout({ tabBarHeight })

  return (
    <TabSafeScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title={mockDashboard.greeting} subtitle={mockChild.name} />

      {mockDashboard.sosActive ? (
        <View style={styles.sosBanner}>
          <SOSCard
            statusText={mockDashboard.sosActive ? 'Active — Safety verification in progress' : 'No active SOS'}
            onPress={() => navigation.navigate('SOS')}
          />
        </View>
      ) : null}

      <StudentCard
        childName={mockChild.name}
        className={`${mockChild.className} · ${mockChild.section}`}
        bus={mockChild.bus}
        attendancePct={mockChild.attendancePct}
      />

      <View style={[styles.quickStatsRow, { gap: layout.gap }]}>
        {STATS.map((s) => (
          <View
            key={s.key}
            style={[
              styles.statCell,
              {
                flexBasis: layout.statCardBasis,
                flexGrow: 1,
                minWidth: layout.statColumns === 1 ? '100%' : 140,
                maxWidth: layout.statColumns === 1 ? '100%' : undefined,
              },
            ]}
          >
            <AttendanceCard
              title={s.title}
              value={mockDashboard.quickStats[s.valueKey]}
              tone={s.tone}
              style={styles.statCardInner}
            />
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={[styles.actionsGrid, { gap: layout.gap }]}>
          <Button variant="outline" style={[styles.actionButton, layout.isCompact && styles.actionButtonFull]} onPress={() => navigation.navigate('Attendance')}>
            View Attendance
          </Button>
          <Button variant="outline" style={[styles.actionButton, layout.isCompact && styles.actionButtonFull]} onPress={() => navigation.navigate('Fees')}>
            Fees
          </Button>
          <Button variant="outline" style={[styles.actionButton, layout.isCompact && styles.actionButtonFull]} onPress={() => navigation.navigate('Chat')}>
            Chat
          </Button>
          <Button variant="danger" style={[styles.actionButton, layout.isCompact && styles.actionButtonFull]} onPress={() => navigation.navigate('SOS')}>
            SOS
          </Button>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {mockDashboard.notifications.map((n) => {
          const tone = n.tone === 'success' ? 'success' : n.tone === 'warning' ? 'warning' : 'neutral'
          return (
            <View key={n.id} style={styles.notificationRow}>
              <Badge tone={tone}>{n.tone === 'default' ? 'Update' : n.tone}</Badge>
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>{n.title}</Text>
                <Text style={styles.notificationTime}>{n.time}</Text>
              </View>
            </View>
          )
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fees Snapshot</Text>
        <FeeCard totalDue={12500} paid={8000} />
      </View>
    </TabSafeScrollView>
  )
}

const styles = StyleSheet.create({
  sosBanner: {
    marginBottom: 2,
  },
  quickStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  statCell: {},
  statCardInner: {
    flex: 1,
  },
  quickActions: {
    marginTop: 2,
  },
  sectionTitle: {
    color: textPrimary,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    minWidth: 140,
  },
  actionButtonFull: {
    width: '100%',
    minWidth: undefined,
  },
  section: {
    marginTop: 4,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(15,23,42,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(229,234,242,1)',
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 10,
  },
  notificationText: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    color: textPrimary,
    fontWeight: '800',
    fontSize: 13,
    flexShrink: 1,
  },
  notificationTime: {
    marginTop: 4,
    color: textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
})
