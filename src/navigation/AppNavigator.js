import React, { useEffect, useMemo, useState } from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { enableScreens } from 'react-native-screens'
import AsyncStorage from '@react-native-async-storage/async-storage'

import LoginScreen from '../screens/auth/LoginScreen.js'
import OTPScreen from '../screens/auth/OTPScreen.js'
import UnifiedPanelScreen from '../screens/dashboard/UnifiedPanelScreen.js'
import TrackingModuleScreen from '../screens/tracking/TrackingModuleScreen.js'
import SafetyModuleScreen from '../screens/safety/SafetyModuleScreen.js'
import TransportModuleScreen from '../screens/transport/TransportModuleScreen.js'
import { background, textPrimary, primary } from '../theme/colors.js'
import { auditEvent } from '../utils/audit.js'

enableScreens()

const AuthStack = createNativeStackNavigator()
const MainStack = createNativeStackNavigator()
const SESSION_KEY = 'parentApp.auth.session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

async function safePersistSession(session) {
  try {
    await AsyncStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        session,
        expiresAt: Date.now() + SESSION_TTL_MS,
      })
    )
    return true
  } catch {
    return false
  }
}

async function safeClearSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY)
  } catch {
    // no-op: avoid crashing when native storage module is unavailable
  }
}

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
        const raw = await AsyncStorage.getItem(SESSION_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        if (!parsed?.session || !parsed?.expiresAt) return
        if (Date.now() > Number(parsed.expiresAt)) {
          await AsyncStorage.removeItem(SESSION_KEY)
          return
        }
        if (!mounted) return
        setSession(parsed.session)
        setIsAuthenticated(true)
      } catch {
        await safeClearSession()
      } finally {
        if (mounted) setBootstrapping(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  if (bootstrapping) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    )
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
          <MainStack.Screen name="UnifiedPanel">
            {(props) => (
              <UnifiedPanelScreen
                {...props}
                session={session}
                onSessionUpdate={async (nextSession) => {
                  setSession(nextSession)
                  await safePersistSession(nextSession)
                }}
                onOpenModule={(module) => {
                  if (module === 'tracking') {
                    props.navigation.navigate('TrackingModule', { session })
                    return
                  }
                  if (module === 'safety') {
                    props.navigation.navigate('SafetyModule', { session })
                    return
                  }
                  if (module === 'transport') {
                    props.navigation.navigate('TransportModule', { session })
                  }
                }}
                onLogout={() => {
                  setIsAuthenticated(false)
                  setSession(null)
                  safeClearSession().catch(() => {})
                }}
              />
            )}
          </MainStack.Screen>
          <MainStack.Screen name="TrackingModule">
            {(props) => <TrackingModuleScreen {...props} />}
          </MainStack.Screen>
          <MainStack.Screen name="SafetyModule">
            {(props) => <SafetyModuleScreen {...props} />}
          </MainStack.Screen>
          <MainStack.Screen name="TransportModule">
            {(props) => <TransportModuleScreen {...props} />}
          </MainStack.Screen>
        </MainStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="OTP">
            {(props) => (
              <OTPScreen
                {...props}
                onVerified={(verifiedSession) => {
                  setSession(verifiedSession)
                  setIsAuthenticated(true)
                  safePersistSession(verifiedSession).catch(() => {})
                  auditEvent('HEADER_RENDERED', { mode: verifiedSession?.mode || 'linked' })
                }}
              />
            )}
          </AuthStack.Screen>
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: background,
  },
})

