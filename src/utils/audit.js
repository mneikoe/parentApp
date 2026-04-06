export function auditEvent(event, payload = {}) {
  const record = {
    event,
    payload,
    ts: new Date().toISOString(),
  }
  // Hook this into backend logging endpoint when available.
  console.log('[PARENT_AUDIT]', record)
}

