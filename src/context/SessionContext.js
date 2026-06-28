/**
 * SessionContext — Global session state for STRAX Parent App.
 * Eliminates prop drilling of `session` through navigator.
 * Every screen can access session via useSession() hook.
 *
 * Usage:
 *   const { session, setSession, logout, activeChild, setActiveChild } = useSession()
 */

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { clearSession, saveSession } from '../utils/secureSession';
import { auditEvent } from '../utils/audit';

const SessionContext = createContext(null);

export function SessionProvider({ children: providerChildren, session, setSession, onLogout }) {
  const [activeChild, setActiveChildState] = useState(null);

  // When session.children changes, auto-set first active child
  useEffect(() => {
    if (session?.children?.length > 0 && !activeChild) {
      setActiveChildState(session.children[0]);
    }
  }, [session?.children]);

  const setActiveChild = useCallback((child) => {
    setActiveChildState(child);
  }, []);

  // Helper: update children list in session + persist
  const setChildren = useCallback(async (kids) => {
    if (!setSession) return;
    setSession((prev) => {
      const updated = { ...prev, children: kids };
      saveSession(updated).catch(() => {});
      return updated;
    });
    if (kids.length > 0) {
      setActiveChildState((prev) => prev || kids[0]);
    }
  }, [setSession]);

  const logout = useCallback(async () => {
    try {
      await clearSession();
      auditEvent('SESSION_LOGOUT', {});
    } catch {
      // swallow
    } finally {
      setActiveChildState(null);
      setSession(null);
      onLogout?.();
    }
  }, [setSession, onLogout]);

  const value = {
    session,
    setSession,
    logout,
    setChildren,
    // Active child across all screens
    activeChild,
    setActiveChild,
    // Convenience accessors
    parentPhone:  session?.phone     || null,
    parentName:   session?.name      || session?.full_name || null,
    children:     session?.children  || [],
    sessionToken: session?.token     || null,
    isValid:      !!session?.token,
  };

  return (
    <SessionContext.Provider value={value}>
      {providerChildren}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }
  return ctx;
}
