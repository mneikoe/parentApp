import React, { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StackSafeScrollView } from '../../components/common/SafeScrollView'
import Button from '../../components/common/Button'
import {
  background,
  border,
  card,
  radius,
  textMuted,
  textPrimary,
  textSecondary,
} from '../../theme/colors'
import { transportData } from '../../utils/moduleData'
import { auditEvent } from '../../utils/audit'

const TABS = ['Live Bus', 'Child Status', 'Route', 'Alerts', 'History']

export default function TransportModuleScreen({ navigation, route }) {
  const insets = useSafeAreaInsets()
  const session = route?.params?.session
  const [activeTab, setActiveTab] = useState('Live Bus')

  const activeChild = useMemo(() => {
    const children = session?.linkedChildren || []
    return children.find((c) => c.id === session?.activeChildId) || children[0] || null
  }, [session])

  const subscription = activeChild?.subscription || 'Active'
  const noPlan = subscription === 'No Plan'
  const grace = subscription === 'Grace'

  const openTab = (tab) => {
    setActiveTab(tab)
    if (tab === 'Live Bus') auditEvent('BUS_MAP_OPENED')
    if (tab === 'Child Status') auditEvent('CHILD_TRANSPORT_STATUS_VIEWED')
    if (tab === 'Route') auditEvent('ROUTE_DETAIL_VIEWED')
    if (tab === 'Alerts') auditEvent('TRANSPORT_ALERT_VIEWED')
    if (tab === 'History') auditEvent('TRANSPORT_HISTORY_VIEWED')
  }

  const renderLive = () => (
    <View style={styles.panelCard}>
      <Text style={styles.sectionTitle}>PU-TRN-01 • Live Bus Map</Text>
      <Text style={styles.metaText}>Route: {transportData.live.route}</Text>
      <Text style={styles.metaText}>Trip: {transportData.live.tripType}</Text>
      <Text style={styles.metaText}>Status: {transportData.live.busStatus}</Text>
      <View style={styles.mapMock}>
        <Text style={styles.mapMockText}>Bus map with route path, stops, ETA and controls</Text>
      </View>
      <Text style={styles.metaText}>Bus: {transportData.live.busId} • Driver: {transportData.live.driver}</Text>
      <Text style={styles.metaText}>Speed: {transportData.live.speed} • ETA: {transportData.live.eta}</Text>
      <View style={styles.actionsRow}>
        <Button variant="outline" style={styles.flexButton} onPress={() => openTab('Route')}>
          View Route
        </Button>
        <Button variant="outline" style={styles.flexButton} onPress={() => openTab('Child Status')}>
          Child Status
        </Button>
        <Button variant="outline" style={styles.flexButton} onPress={() => openTab('Alerts')}>
          Alerts
        </Button>
      </View>
    </View>
  )

  const renderStatus = () => (
    <View style={styles.panelCard}>
      <Text style={styles.sectionTitle}>PU-TRN-02 • Child Transport Status</Text>
      <Text style={styles.metaText}>Boarding: {transportData.childStatus.boarding}</Text>
      <Text style={styles.metaText}>Boarding time: {transportData.childStatus.boardingTime}</Text>
      <Text style={styles.metaText}>Drop: {transportData.childStatus.drop}</Text>
      <Text style={styles.metaText}>Stop: {transportData.childStatus.stop}</Text>
      <Text style={styles.metaText}>Stop time: {transportData.childStatus.stopTime}</Text>
      <Text style={styles.metaText}>RFID source: {transportData.childStatus.rfidSource}</Text>
      <Text style={styles.metaText}>Manual source: {transportData.childStatus.manualSource}</Text>
      <Text style={styles.metaText}>Device correlation: {transportData.childStatus.deviceCorrelation}</Text>
    </View>
  )

  const renderRoute = () => (
    <View style={styles.panelCard}>
      <Text style={styles.sectionTitle}>PU-TRN-03 • Route & Stop Detail</Text>
      {transportData.routeStops.map((row) => (
        <Text key={row} style={styles.metaText}>• {row}</Text>
      ))}
    </View>
  )

  const renderAlerts = () => (
    <View style={styles.panelCard}>
      <Text style={styles.sectionTitle}>PU-TRN-04 • Transport Alerts</Text>
      {transportData.alerts.map((row) => (
        <Pressable key={row} style={styles.listItem}>
          <Text style={styles.listTitle}>{row}</Text>
          <Text style={styles.metaText}>Severity and status visible in detail panel.</Text>
        </Pressable>
      ))}
    </View>
  )

  const renderHistory = () => (
    <View style={styles.panelCard}>
      <Text style={styles.sectionTitle}>PU-TRN-05 • Transport Timeline / History</Text>
      {transportData.history.map((row) => (
        <Text key={row} style={styles.metaText}>• {row}</Text>
      ))}
      <Text style={[styles.metaText, styles.mt6]}>
        Correlation: Boarded bus -> expected present. Mismatch feeds safety alerts.
      </Text>
    </View>
  )

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <View style={styles.flex1}>
          <Text style={styles.headerTitle}>Transport / Bus Tracking</Text>
          <Text style={styles.headerSub}>Vehicle tracking + boarding intelligence + safety linkage</Text>
        </View>
      </View>

      <StackSafeScrollView>
        {noPlan ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>No Plan: only basic transport status available.</Text>
          </View>
        ) : null}
        {grace ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>Grace mode: limited transport tracking + critical alerts.</Text>
          </View>
        ) : null}

        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <Pressable key={tab} onPress={() => openTab(tab)} style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'Live Bus' ? renderLive() : null}
        {activeTab === 'Child Status' ? renderStatus() : null}
        {activeTab === 'Route' ? renderRoute() : null}
        {activeTab === 'Alerts' ? renderAlerts() : null}
        {activeTab === 'History' ? renderHistory() : null}

        <View style={[styles.panelCard, styles.securityCard]}>
          <Text style={styles.sectionTitle}>Security Rules</Text>
          <Text style={styles.metaText}>Parent can view bus location, boarding/drop and transport alerts.</Text>
          <Text style={styles.metaText}>Parent cannot change route, mark boarding, or control vehicle.</Text>
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
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabPill: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: card,
  },
  tabPillActive: {
    backgroundColor: 'rgba(250,204,21,0.2)',
    borderColor: 'rgba(250,204,21,0.55)',
  },
  tabText: { color: textSecondary, fontSize: 12, fontWeight: '800' },
  tabTextActive: { color: '#FDE68A' },
  panelCard: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radius.lg,
    backgroundColor: card,
    padding: 12,
  },
  sectionTitle: { color: textPrimary, fontSize: 14, fontWeight: '900', marginBottom: 8 },
  metaText: { color: textSecondary, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  mapMock: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 12,
    minHeight: 130,
    backgroundColor: 'rgba(59,130,246,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  mapMockText: { color: textPrimary, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  flexButton: { flexGrow: 1, minWidth: 96 },
  warningBox: {
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.5)',
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  warningText: { color: textPrimary, fontSize: 12, fontWeight: '800' },
  listItem: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    marginBottom: 8,
  },
  listTitle: { color: textPrimary, fontSize: 12, fontWeight: '900', marginBottom: 3 },
  securityCard: {
    borderColor: 'rgba(245,158,11,0.4)',
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  mt6: { marginTop: 6 },
  flex1: { flex: 1 },
})

