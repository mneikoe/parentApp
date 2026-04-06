import React, { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StackSafeScrollView } from '../../components/common/SafeScrollView'
import Button from '../../components/common/Button'
import {
  background,
  border,
  card,
  danger,
  radius,
  textMuted,
  textPrimary,
  textSecondary,
  warning,
} from '../../theme/colors'
import { safetyData } from '../../utils/moduleData'
import { auditEvent } from '../../utils/audit'

const TABS = ['All', 'SOS', 'Attendance', 'Device', 'Movement', 'Behaviour', 'Timeline']

function severityStyle(severity) {
  if (severity === 'Critical') return styles.critical
  if (severity === 'High') return styles.high
  if (severity === 'Medium') return styles.medium
  return styles.info
}

export default function SafetyModuleScreen({ navigation, route }) {
  const insets = useSafeAreaInsets()
  const session = route?.params?.session
  const [activeTab, setActiveTab] = useState('All')

  const activeChild = useMemo(() => {
    const children = session?.linkedChildren || []
    return children.find((c) => c.id === session?.activeChildId) || children[0] || null
  }, [session])

  const subscription = activeChild?.subscription || 'Active'
  const limitedSafety = subscription === 'No Plan' || subscription === 'Grace'

  const onTabPress = (tab) => {
    setActiveTab(tab)
    auditEvent('ALERT_FILTER_USED', { tab })
  }

  const alertRows = useMemo(() => {
    if (activeTab === 'All') return safetyData.alerts
    if (activeTab === 'SOS') return safetyData.alerts.filter((a) => a.type.includes('SOS'))
    if (activeTab === 'Attendance') return safetyData.alerts.filter((a) => a.type.includes('Attendance'))
    if (activeTab === 'Device') return safetyData.alerts.filter((a) => a.type.includes('Device'))
    if (activeTab === 'Movement') return safetyData.alerts.filter((a) => a.type.includes('Geofence'))
    if (activeTab === 'Behaviour') return []
    return []
  }, [activeTab])

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <View style={styles.flex1}>
          <Text style={styles.headerTitle}>Safety & Alerts</Text>
          <Text style={styles.headerSub}>Real-time safety monitoring with escalation</Text>
        </View>
      </View>

      <StackSafeScrollView>
        <View style={styles.panelCard}>
          <Text style={styles.sectionTitle}>PU-SAFE-01 • Alerts Feed</Text>
          <View style={styles.tabRow}>
            {TABS.map((tab) => (
              <Pressable key={tab} onPress={() => onTabPress(tab)} style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>

          {limitedSafety ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Subscription gating active: only critical/limited high alerts shown.
              </Text>
            </View>
          ) : null}

          {alertRows.length === 0 ? (
            <Text style={styles.metaText}>No alerts in selected tab.</Text>
          ) : (
            alertRows.map((alert) => (
              <Pressable
                key={alert.id}
                onPress={() => auditEvent('ALERT_OPENED', { alertId: alert.id })}
                style={styles.listItem}
              >
                <View style={[styles.severityBar, severityStyle(alert.severity)]} />
                <View style={styles.flex1}>
                  <Text style={styles.listTitle}>{alert.type} • {alert.status}</Text>
                  <Text style={styles.metaText}>{alert.message}</Text>
                  <Text style={styles.metaText}>Time: {alert.time}</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.panelCard}>
          <Text style={styles.sectionTitle}>PU-SAFE-02 • SOS Incident Panel</Text>
          {safetyData.sosTimeline.map((row) => (
            <Text key={row} style={styles.metaText}>• {row}</Text>
          ))}
          <View style={styles.actionsRow}>
            <Button variant="outline" style={styles.flexButton}>Raise Ticket</Button>
            <Button variant="outline" style={styles.flexButton}>Start Live Chat</Button>
            <Button variant="danger" style={styles.flexButton}>Emergency Contact</Button>
          </View>
        </View>

        <View style={styles.panelCard}>
          <Text style={styles.sectionTitle}>PU-SAFE-03 • Attendance Mismatch Alerts</Text>
          {safetyData.mismatch.map((item) => (
            <Pressable key={item.id} onPress={() => auditEvent('ATTENDANCE_MISMATCH_VIEWED', { mismatchId: item.id })} style={styles.listItemCompact}>
              <Text style={styles.listTitle}>{item.date} • {item.type}</Text>
              <Text style={styles.metaText}>Severity: {item.severity} • Status: {item.status}</Text>
              <Text style={styles.metaText}>{item.details}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.panelCard}>
          <Text style={styles.sectionTitle}>PU-SAFE-04/05/06/07 • Device, Geofence, Behaviour, Timeline</Text>
          <Text style={[styles.metaText, styles.subHeading]}>Device Safety Alerts</Text>
          {safetyData.deviceAlerts.map((a) => <Text key={a} style={styles.metaText}>• {a}</Text>)}
          <Text style={[styles.metaText, styles.subHeading]}>Geofence & Movement Alerts</Text>
          {safetyData.geofenceAlerts.map((a) => <Text key={a} style={styles.metaText}>• {a}</Text>)}
          <Text style={[styles.metaText, styles.subHeading]}>Behaviour / Discipline (read-only)</Text>
          {safetyData.behaviourAlerts.map((a) => <Text key={a} style={styles.metaText}>• {a}</Text>)}
          <Text style={[styles.metaText, styles.subHeading]}>Safety Timeline</Text>
          {safetyData.timeline.map((a) => <Text key={a} style={styles.metaText}>• {a}</Text>)}
        </View>

        <View style={[styles.panelCard, styles.securityBox]}>
          <Text style={styles.sectionTitle}>Security Rules</Text>
          <Text style={styles.metaText}>Parent can view alerts and escalate via ticket/chat.</Text>
          <Text style={styles.metaText}>Parent cannot delete alerts or modify attendance/behaviour records.</Text>
          <Text style={styles.metaText}>Priority engine: SOS → Critical → High → Medium → Info.</Text>
        </View>
      </StackSafeScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(23,40,69,0.98)',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: textPrimary, fontSize: 20, fontWeight: '900' },
  headerTitle: { color: textPrimary, fontSize: 15, fontWeight: '900' },
  headerSub: { color: textMuted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  panelCard: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radius.lg,
    backgroundColor: card,
    padding: 12,
  },
  sectionTitle: { color: textPrimary, fontSize: 14, fontWeight: '900', marginBottom: 8 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tabPill: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tabPillActive: {
    borderColor: 'rgba(250,204,21,0.55)',
    backgroundColor: 'rgba(250,204,21,0.2)',
  },
  tabText: { color: textSecondary, fontSize: 11, fontWeight: '800' },
  tabTextActive: { color: '#FDE68A' },
  warningBox: {
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.5)',
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.15)',
    padding: 10,
    marginBottom: 8,
  },
  warningText: { color: textPrimary, fontWeight: '800', fontSize: 12 },
  listItem: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    marginBottom: 8,
  },
  severityBar: {
    width: 6,
    borderRadius: 6,
  },
  critical: { backgroundColor: danger },
  high: { backgroundColor: '#FB7185' },
  medium: { backgroundColor: warning },
  info: { backgroundColor: '#CBD5E1' },
  listItemCompact: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    marginBottom: 8,
  },
  listTitle: { color: textPrimary, fontSize: 12, fontWeight: '900', marginBottom: 3 },
  metaText: { color: textSecondary, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  actionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  flexButton: { flexGrow: 1, minWidth: 96 },
  subHeading: { color: textPrimary, marginTop: 8, marginBottom: 2, fontWeight: '900' },
  securityBox: {
    borderColor: 'rgba(96,165,250,0.45)',
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  flex1: { flex: 1 },
})

