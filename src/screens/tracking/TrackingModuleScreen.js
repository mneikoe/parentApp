import React, { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StackSafeScrollView } from '../../components/common/SafeScrollView'
import Button from '../../components/common/Button'
import {
  background,
  border,
  card,
  primary,
  radius,
  textMuted,
  textPrimary,
  textSecondary,
} from '../../theme/colors'
import { trackingData } from '../../utils/moduleData'
import { auditEvent } from '../../utils/audit'

const TABS = ['Live Map', 'History', 'Geofence', 'Movement']

function getStatusStyle(status) {
  if (status === 'Offline') return styles.bannerOffline
  if (status === 'Stale') return styles.bannerStale
  return styles.bannerLive
}

export default function TrackingModuleScreen({ navigation, route }) {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState('Live Map')
  const session = route?.params?.session
  const activeChild = useMemo(() => {
    const children = session?.linkedChildren || []
    return children.find((c) => c.id === session?.activeChildId) || children[0] || null
  }, [session])

  const subscription = activeChild?.subscription || 'Active'
  const isNoPlan = subscription === 'No Plan'
  const isGrace = subscription === 'Grace'

  const onTabPress = (tab) => {
    setActiveTab(tab)
    if (tab === 'History') auditEvent('HISTORY_OPENED')
    if (tab === 'Geofence') auditEvent('GEOFENCE_OPENED')
    if (tab === 'Live Map') auditEvent('LIVE_TRACKING_OPENED')
    if (tab === 'Movement') auditEvent('MOVEMENT_SUMMARY_VIEWED')
  }

  const renderLiveMap = () => (
    <View style={styles.sectionBlock}>
      <View style={[styles.stateBanner, getStatusStyle(trackingData.liveMap.status)]}>
        <Text style={styles.stateBannerText}>
          {trackingData.liveMap.status === 'Live'
            ? 'Live tracking active'
            : trackingData.liveMap.status === 'Stale'
            ? 'Last update delayed'
            : 'Device heartbeat missing. Showing last known location.'}
        </Text>
      </View>
      <View style={styles.panelCard}>
        <Text style={styles.sectionTitle}>PU-TRK-01 • Live Tracking Map</Text>
        <Text style={styles.metaText}>Child: {activeChild?.name || 'N/A'}</Text>
        <Text style={styles.metaText}>Zone: {trackingData.liveMap.zone}</Text>
        <Text style={styles.metaText}>Status: {trackingData.liveMap.status}</Text>
        <View style={styles.mapMock}>
          <Text style={styles.mapMockText}>Map with live pin, trail, zone boundary, controls</Text>
        </View>
        <Text style={styles.metaText}>Address: {trackingData.liveMap.location}</Text>
        <Text style={styles.metaText}>Coordinates: {trackingData.liveMap.coordinates}</Text>
        <Text style={styles.metaText}>
          Movement: {trackingData.liveMap.movement} • Speed {trackingData.liveMap.speed}
        </Text>
        <Text style={styles.metaText}>Last update: {trackingData.liveMap.lastUpdate}</Text>
        <Text style={styles.metaText}>Primary: {trackingData.liveMap.primaryDevice}</Text>
        <Text style={styles.metaText}>
          Secondary: {trackingData.liveMap.secondaryDevice} ({trackingData.liveMap.secondaryReason})
        </Text>
        <View style={styles.actionsRow}>
          <Button variant="outline" style={styles.flexButton} onPress={() => onTabPress('History')}>
            View History
          </Button>
          <Button variant="outline" style={styles.flexButton} onPress={() => onTabPress('Geofence')}>
            Geofence
          </Button>
          <Button variant="outline" style={styles.flexButton} onPress={() => navigation.navigate('SafetyModule', { session })}>
            Safety Alerts
          </Button>
        </View>
      </View>
    </View>
  )

  const renderHistory = () => (
    <View style={styles.panelCard}>
      <Text style={styles.sectionTitle}>PU-TRK-02 • Location Timeline / History</Text>
      {isNoPlan ? (
        <View style={styles.lockedBox}>
          <Text style={styles.lockedText}>No Plan: History is locked. Last known location only.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.metaText}>Filters: Date • Time range • Zone</Text>
          {trackingData.history.map((row) => (
            <Pressable key={row.id} onPress={() => auditEvent('LOCATION_HISTORY_VIEWED', { item: row.id })} style={styles.listItem}>
              <Text style={styles.listTitle}>{row.range} • {row.zone}</Text>
              <Text style={styles.metaText}>{row.movement} • {row.address}</Text>
              <Text style={styles.metaText}>Duration: {row.duration}</Text>
            </Pressable>
          ))}
          <View style={styles.actionsRow}>
            <Button variant="outline" style={styles.flexButton}>Play Route</Button>
            <Button variant="outline" style={styles.flexButton}>Pause</Button>
            <Button variant="outline" style={styles.flexButton}>Speed x2</Button>
          </View>
        </>
      )}
    </View>
  )

  const renderGeofence = () => (
    <View style={styles.panelCard}>
      <Text style={styles.sectionTitle}>PU-TRK-03/04 • Geofence & Safe Zones</Text>
      {isNoPlan ? (
        <View style={styles.lockedBox}>
          <Text style={styles.lockedText}>No Plan: Geofence management disabled.</Text>
        </View>
      ) : (
        <>
          {trackingData.geofences.map((zone) => (
            <View key={zone.id} style={styles.listItem}>
              <Text style={styles.listTitle}>{zone.name} • {zone.status}</Text>
              <Text style={styles.metaText}>Radius: {zone.radius} • Hours: {zone.hours}</Text>
              <Text style={styles.metaText}>Alerts: {zone.alert} • Last breach: {zone.lastBreach}</Text>
            </View>
          ))}
          <View style={styles.actionsRow}>
            <Button variant="outline" style={styles.flexButton} onPress={() => auditEvent('GEOFENCE_CREATED')}>
              Add Zone
            </Button>
            <Button variant="outline" style={styles.flexButton} onPress={() => auditEvent('GEOFENCE_UPDATED')}>
              Edit Zone
            </Button>
            <Button variant="outline" style={styles.flexButton}>View on Map</Button>
          </View>
        </>
      )}
    </View>
  )

  const renderMovement = () => (
    <View style={styles.panelCard}>
      <Text style={styles.sectionTitle}>PU-TRK-05 • Movement Intelligence</Text>
      <Text style={styles.metaText}>School time: {trackingData.movement.school}</Text>
      <Text style={styles.metaText}>Home time: {trackingData.movement.home}</Text>
      <Text style={styles.metaText}>Transit time: {trackingData.movement.transit}</Text>
      <Text style={styles.metaText}>Outside safe zones: {trackingData.movement.outsideSafeZone}</Text>
      <Text style={[styles.metaText, styles.mt6]}>Suspicious patterns:</Text>
      {trackingData.movement.suspicious.map((s) => (
        <Text key={s} style={styles.metaText}>• {s}</Text>
      ))}
      <Text style={[styles.metaText, styles.mt8]}>
        Attendance correlation: {trackingData.movement.attendanceCorrelation}
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
          <Text style={styles.headerTitle}>Live Tracking Module</Text>
          <Text style={styles.headerSub}>
            Primary → Secondary failover • Parent view-only • Subscription gated
          </Text>
        </View>
      </View>

      <StackSafeScrollView>
        {isGrace ? (
          <View style={[styles.stateBanner, styles.bannerStale]}>
            <Text style={styles.stateBannerText}>Grace mode: limited tracking, critical alerts prioritized.</Text>
          </View>
        ) : null}

        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => onTabPress(tab)}
              style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'Live Map' ? renderLiveMap() : null}
        {activeTab === 'History' ? renderHistory() : null}
        {activeTab === 'Geofence' ? renderGeofence() : null}
        {activeTab === 'Movement' ? renderMovement() : null}
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
  tabTextActive: { color: primary },
  sectionBlock: { gap: 10 },
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
    minHeight: 150,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  mapMockText: { color: textPrimary, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  flexButton: { flexGrow: 1, minWidth: 96 },
  listItem: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  listTitle: { color: textPrimary, fontSize: 12, fontWeight: '900', marginBottom: 2 },
  lockedBox: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.16)',
    padding: 10,
  },
  lockedText: { color: '#FECACA', fontWeight: '800', fontSize: 12 },
  stateBanner: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bannerLive: { borderColor: 'rgba(16,185,129,0.5)', backgroundColor: 'rgba(16,185,129,0.14)' },
  bannerStale: { borderColor: 'rgba(245,158,11,0.5)', backgroundColor: 'rgba(245,158,11,0.18)' },
  bannerOffline: { borderColor: 'rgba(239,68,68,0.5)', backgroundColor: 'rgba(239,68,68,0.18)' },
  stateBannerText: { color: textPrimary, fontWeight: '800', fontSize: 12 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  flex1: { flex: 1 },
})

