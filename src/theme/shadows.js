/**
 * STRAX Shadows & Elevations — Light Theme
 * Using subtle rgba(15, 23, 42, opacity) soft shadows for a premium look.
 */

import { Platform } from 'react-native';
import { primary } from './colors';

const shadowDefs = {
  none: {
    ios: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
    android: { elevation: 0 },
  },
  sm: {
    // elevation-1: 0px 1px 2px rgba(15, 23, 42, 0.05)
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    android: { elevation: 1 },
  },
  md: {
    // elevation-2: 0px 4px 8px rgba(15, 23, 42, 0.06)
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8 },
    android: { elevation: 3 },
  },
  lg: {
    // elevation-3: 0px 8px 20px rgba(15, 23, 42, 0.10)
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 20 },
    android: { elevation: 6 },
  },
  xl: {
    // elevation-4: 0px 12px 28px rgba(15, 23, 42, 0.12)
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 28 },
    android: { elevation: 10 },
  },
  glow: {
    ios: { shadowColor: primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
    android: { elevation: 4 },
  },
};

export const shadowStyle = (level = 'md') => {
  const def = shadowDefs[level] || shadowDefs.md;
  return Platform.OS === 'ios' ? def.ios : def.android;
};

export const shadows = {
  none:  shadowStyle('none'),
  sm:    shadowStyle('sm'),
  md:    shadowStyle('md'),
  lg:    shadowStyle('lg'),
  xl:    shadowStyle('xl'),
  glow:  shadowStyle('glow'),
};
