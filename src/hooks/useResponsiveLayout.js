import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Shared responsive metrics for Parent App screens.
 * @param {{ tabBarHeight?: number }} opts
 */
export default function useResponsiveLayout(opts = {}) {
  const { tabBarHeight = 0 } = opts
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  return useMemo(() => {
    const isCompact = width < 360
    const isTablet = width >= 768
    const horizontalPadding = isCompact ? 12 : isTablet ? 24 : 16
    const maxContentWidth = isTablet ? 560 : width
    const gap = isCompact ? 10 : 12

    /** Stat cards: 1 / 2 / 3 columns */
    let statColumns = 3
    if (width < 420) statColumns = 1
    else if (width < 720) statColumns = 2

    const statCardBasis =
      statColumns === 1 ? '100%' : statColumns === 2 ? '48%' : '31%'

    const scrollBottomPadding = tabBarHeight + insets.bottom + (isCompact ? 20 : 28)

    return {
      width,
      height,
      isCompact,
      isTablet,
      horizontalPadding,
      maxContentWidth,
      gap,
      statColumns,
      statCardBasis,
      insets,
      scrollBottomPadding,
    }
  }, [width, height, insets, tabBarHeight])
}
