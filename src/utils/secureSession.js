/**
 * secureSession.js
 * ─────────────────────────────────────────────────────────────
 * Secure token storage using expo-secure-store.
 *
 * Architecture:
 *  - Access token, refresh token, session data → expo-secure-store (encrypted)
 *  - Non-sensitive UI prefs (language, theme) → AsyncStorage
 *
 * In Expo Go dev environment where SecureStore is unavailable,
 * falls back to AsyncStorage with a console warning.
 */

'use strict';

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'strax.parent.session.v2';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Check if SecureStore is available on this platform.
 * expo-secure-store is unavailable in Expo Go on some simulators.
 */
const isSecureAvailable = async () => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

/**
 * secureSet — Store an encrypted value.
 */
const secureSet = async (key, value) => {
  const available = await isSecureAvailable();
  if (available) {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  } else {
    // Dev fallback — warn developer
    console.warn('[secureSession] SecureStore unavailable — falling back to AsyncStorage (DEV ONLY)');
    await AsyncStorage.setItem(key, value);
  }
};

/**
 * secureGet — Retrieve an encrypted value.
 */
const secureGet = async (key) => {
  const available = await isSecureAvailable();
  if (available) {
    return await SecureStore.getItemAsync(key);
  } else {
    return await AsyncStorage.getItem(key);
  }
};

/**
 * secureDelete — Delete an encrypted value.
 */
const secureDelete = async (key) => {
  const available = await isSecureAvailable();
  if (available) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
};

/**
 * saveSession — Persist the full session object securely.
 *
 * @param {Object} session  Must include { token, refresh_token, user, roles, linked_children }
 */
export const saveSession = async (session) => {
  try {
    const payload = JSON.stringify({
      session,
      savedAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    await secureSet(SESSION_KEY, payload);
    return true;
  } catch (err) {
    console.error('[secureSession] saveSession failed:', err.message);
    return false;
  }
};

/**
 * loadSession — Load and validate a persisted session.
 * Returns null if session is absent or expired.
 */
export const loadSession = async () => {
  try {
    const raw = await secureGet(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.session || !parsed?.expiresAt) return null;

    if (Date.now() > Number(parsed.expiresAt)) {
      await clearSession();
      return null;
    }

    return parsed.session;
  } catch (err) {
    console.warn('[secureSession] loadSession failed:', err.message);
    await clearSession();
    return null;
  }
};

/**
 * clearSession — Remove all session data.
 */
export const clearSession = async () => {
  try {
    await secureDelete(SESSION_KEY);
  } catch (err) {
    console.warn('[secureSession] clearSession failed:', err.message);
  }
};

/**
 * getAccessToken — Get only the access token from session.
 * Used by api.js HTTP client for Authorization header injection.
 */
export const getAccessToken = async () => {
  const session = await loadSession();
  return session?.token || null;
};
