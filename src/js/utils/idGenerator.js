/**
 * utils/idGenerator.js
 *
 * Generates unique identifiers for new records (students, teams, events)
 * before they're persisted.
 */

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID.
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
