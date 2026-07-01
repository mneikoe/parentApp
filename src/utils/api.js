/**
 * api.js — STRAX Parent App HTTP Client
 * ─────────────────────────────────────────────────────────────
 * Centralized API wrapper for all backend calls.
 * Automatically injects Authorization header from secure storage.
 */

'use strict';

import { getAccessToken } from './secureSession';

// ─── Base URL ─────────────────────────────────────────────────
// Change this to your backend IP for device testing
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.180:8082';
export const MOBILE_PARENT_API = `${API_BASE}/api/mobile/parent`;

// ─── Core Fetch Wrapper ───────────────────────────────────────

const apiFetch = async (method, url, body = null, requiresAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

// ─── Public Methods ───────────────────────────────────────────

/**
 * Authenticated GET
 */
export const parentGet = async (path) => {
  return apiFetch('GET', `${MOBILE_PARENT_API}${path}`, null, true);
};

/**
 * Public GET (no auth)
 */
export const publicGet = async (path) => {
  return apiFetch('GET', `${API_BASE}${path}`, null, false);
};

/**
 * Authenticated POST
 */
export const parentPost = async (path, body) => {
  return apiFetch('POST', `${MOBILE_PARENT_API}${path}`, body, true);
};

/**
 * Public POST (no auth — for OTP request/verify)
 */
export const publicPost = async (path, body) => {
  return apiFetch('POST', `${MOBILE_PARENT_API}${path}`, body, false);
};

/**
 * Authenticated PATCH
 */
export const parentPatch = async (path, body) => {
  return apiFetch('PATCH', `${MOBILE_PARENT_API}${path}`, body, true);
};

// ─── PTM API Methods ──────────────────────────────────────────
export const ptmGet = async (path) => {
  return apiFetch('GET', `${API_BASE}/api/ptm${path}`, null, true);
};

export const ptmPost = async (path, body) => {
  return apiFetch('POST', `${API_BASE}/api/ptm${path}`, body, true);
};

/**
 * Authenticated POST for Fees API (e.g. /api/fee/payment/offline/*)
 */
export const feePost = async (path, body) => {
  return apiFetch('POST', `${API_BASE}/api/fee${path}`, body, true);
};

export const feeGet = async (path) => {
  return apiFetch('GET', `${API_BASE}/api/fee${path}`, null, true);
};


