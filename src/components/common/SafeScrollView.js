import React from 'react'
import { ScrollView, StyleSheet, View, StatusBar, Platform } from 'react-native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { background } from '../../theme/colors'
import useResponsiveLayout from '../../hooks/useResponsiveLayout'

function BaseSafeScrollView({
  children,
  tabBarHeight = 0,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps,
  ...rest
}) {
  const layout = useResponsiveLayout({ tabBarHeight })
  
  // Calculate safe status bar top height fallback
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  const safeTopPadding = Math.max(layout.insets.top, statusBarHeight) + 12

  return (
    <View style={[styles.root, { backgroundColor: background }, style]}>
      <ScrollView
        {...rest}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        style={styles.flex}
        contentContainerStyle={[
          {
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: safeTopPadding,
            paddingBottom: layout.scrollBottomPadding,
            flexGrow: 1,
            gap: layout.gap,
            alignItems: layout.isTablet ? 'center' : 'stretch',
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      >
        <View style={[styles.inner, { maxWidth: layout.maxContentWidth, width: '100%' }]}>
          {children}
        </View>
      </ScrollView>
    </View>
  )
}

/** Use inside bottom-tab screens only (hooks into tab bar height). */
export function TabSafeScrollView(props) {
  const tabBarHeight = useBottomTabBarHeight()
  return <BaseSafeScrollView tabBarHeight={tabBarHeight} {...props} />
}

/** Use for auth stack, SOS stack screen, etc. */
export function StackSafeScrollView(props) {
  return <BaseSafeScrollView tabBarHeight={0} {...props} />
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  inner: {
    alignSelf: 'stretch',
  },
})
