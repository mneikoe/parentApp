/**
 * AppNavigator — STRAX Parent App Navigation Architecture v2
 *
 * Structure:
 *   App
 *   ├── BootScreen (loading session)
 *   ├── AuthStack  → LoginScreen → OTPScreen
 *   └── MainTabs (Bottom Tab Navigator)
 *        ├── HomeStack    → DashboardScreen
 *        ├── Academics    → AttendanceScreen, FeesScreen
 *        ├── Transport    → TransportModuleScreen
 *        ├── Payments     → FeesScreen
 *        └── Profile      → ProfileScreen
 *
 * Session is provided via SessionContext — no prop drilling through navigator.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ActivityIndicator, StyleSheet, View, Animated } from 'react-native'
import { enableScreens } from 'react-native-screens'
import { loadSession, clearSession } from '../utils/secureSession'
import { SessionProvider } from '../context/SessionContext'
import { background, textPrimary, primary } from '../theme/colors'
import { auditEvent } from '../utils/audit'

// ── Screens ──────────────────────────────────────────────────
import LoginScreen            from '../screens/auth/LoginScreen'
import OTPScreen              from '../screens/auth/OTPScreen'
import DashboardScreen        from '../screens/dashboard/DashboardScreen'
import AttendanceScreen       from '../screens/attendance/AttendanceScreen'
import FeesScreen             from '../screens/fees/FeesScreen'
import TransportModuleScreen  from '../screens/transport/TransportModuleScreen'
import ProfileScreen          from '../screens/profile/ProfileScreen'
import RaiseComplaintScreen   from '../screens/profile/RaiseComplaintScreen'
import ComplaintsListScreen  from '../screens/profile/ComplaintsListScreen'
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen'

// ── Custom Nav UI ─────────────────────────────────────────────
import BottomTabBar from '../components/navigation/BottomTabBar'

enableScreens()

const AuthStack          = createNativeStackNavigator()
const Tab                = createBottomTabNavigator()
const HomeStack          = createNativeStackNavigator()
const NotificationsStack = createNativeStackNavigator()

// ── Home Stack ────────────────────────────────────────────────
import LinkChildScreen from '../screens/profile/LinkChildScreen'
import ParentPTMListScreen from '../screens/ptm/ParentPTMListScreen'
import ParentPTMRoomScreen from '../screens/ptm/ParentPTMRoomScreen'

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStack.Screen name="LinkChild" component={LinkChildScreen} />
      <HomeStack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
      <HomeStack.Screen name="ParentPTMList" component={ParentPTMListScreen} />
      <HomeStack.Screen name="ParentPTMRoom" component={ParentPTMRoomScreen} />
    </HomeStack.Navigator>
  )
}

// ── Academics Stack ───────────────────────────────────────────
import HomeworkDetailScreen   from '../screens/attendance/HomeworkDetailScreen'

const AcademicsStack = createNativeStackNavigator()
function AcademicsNavigator() {
  return (
    <AcademicsStack.Navigator screenOptions={{ headerShown: false }}>
      <AcademicsStack.Screen name="Attendance" component={AttendanceScreen} />
      <AcademicsStack.Screen name="HomeworkDetail" component={HomeworkDetailScreen} />
    </AcademicsStack.Navigator>
  )
}

// ── Transport Stack ───────────────────────────────────────────
const TransportStack = createNativeStackNavigator()
function TransportNavigator() {
  return (
    <TransportStack.Navigator screenOptions={{ headerShown: false }}>
      <TransportStack.Screen name="TransportMain" component={TransportModuleScreen} />
    </TransportStack.Navigator>
  )
}

// ── Payments Stack ────────────────────────────────────────────
const PaymentsStack = createNativeStackNavigator()
function PaymentsNavigator() {
  return (
    <PaymentsStack.Navigator screenOptions={{ headerShown: false }}>
      <PaymentsStack.Screen name="Fees" component={FeesScreen} />
    </PaymentsStack.Navigator>
  )
}

// ── Profile Stack ─────────────────────────────────────────────
const ProfileStack = createNativeStackNavigator()
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="ComplaintsList" component={ComplaintsListScreen} />
      <ProfileStack.Screen name="RaiseComplaint" component={RaiseComplaintScreen} />
    </ProfileStack.Navigator>
  )
}



// ── Main Tabs ─────────────────────────────────────────────────
function MainTabs() {
  const [unreadCount, setUnreadCount] = useState(0)

  // Poll unread count every 60 s
  useEffect(() => {
    let mounted = true
    const fetchCount = async () => {
      try {
        const { getAccessToken } = require('../utils/secureSession')
        const { MOBILE_PARENT_API } = require('../utils/api')
        const token = await getAccessToken()
        const res = await fetch(`${MOBILE_PARENT_API}/notifications/unread-count`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await res.json().catch(() => ({}))
        if (mounted) setUnreadCount(data.unreadCount || 0)
      } catch {
        // silent — badge is best-effort
      }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 60000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home"          component={HomeNavigator} />
      <Tab.Screen name="Academics"     component={AcademicsNavigator} />
      <Tab.Screen name="Transport"     component={TransportNavigator} />
      <Tab.Screen name="Payments"      component={PaymentsNavigator} />
      <Tab.Screen name="Profile"       component={ProfileNavigator} />
    </Tab.Navigator>
  )
}

// ── Auth Stack ────────────────────────────────────────────────
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen'

function AuthNavigator({ onVerified }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="OTP">
        {(props) => (
          <OTPScreen
            {...props}
            onVerified={onVerified}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  )
}

// ── Boot Splash ───────────────────────────────────────────────
function BootScreen() {
  return (
    <View style={styles.boot}>
      <ActivityIndicator size="large" color={primary} />
    </View>
  )
}

// ── Root Navigator ────────────────────────────────────────────
export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [session, setSession] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background,
        text: textPrimary,
        primary,
      },
    }),
    []
  )

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const loadedSession = await loadSession()
        if (!loadedSession || !mounted) return

        // Back-fill full_name from name for old sessions
        const enriched = {
          ...loadedSession,
          full_name: loadedSession.full_name || loadedSession.name || null,
          name:      loadedSession.name      || loadedSession.full_name || null,
        }
        setSession(enriched)
        setIsAuthenticated(true)
      } catch {
        await clearSession().catch(() => {})
      } finally {
        if (mounted) setBootstrapping(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleVerified = useCallback((verifiedSession) => {
    setSession(verifiedSession)
    setIsAuthenticated(true)
    auditEvent('AUTH_SUCCESS', { phone: verifiedSession?.phone })
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setSession(null)
  }, [])

  if (bootstrapping) {
    return <BootScreen />
  }

  // If authenticated but profile name is not set yet, route to setup
  const showSetup = isAuthenticated && !session?.name && !session?.full_name

  return (
    <NavigationContainer theme={navigationTheme}>
      <SessionProvider
        session={session}
        setSession={setSession}
        onLogout={handleLogout}
      >
        {isAuthenticated ? (
          showSetup ? (
            <AuthStack.Navigator screenOptions={{ headerShown: false }}>
              <AuthStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            </AuthStack.Navigator>
          ) : (
            <MainTabs />
          )
        ) : (
          <AuthNavigator onVerified={handleVerified} />
        )}
      </SessionProvider>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  boot: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: background,
  },
})
