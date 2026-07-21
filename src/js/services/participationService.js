/**
 * services/participationService.js
 *
 * Reads and appends to a Student's Participation History — the
 * append-only log backing "Current Session Score", "Total Positive
 * Points", "Total Negative Points", and the profile's timeline (see
 * models/Student.js). `score` is a derived cache kept in sync with this
 * log, not the source of truth itself, matching the event-driven
 * approach used elsewhere in this app (see models/Event.js).
 *
 * This is scoped to the Student Profile page's own "Log Participation"
 * control — a separate, minimal way to record a point change with a
 * reason. It is not the click-a-team-card scoring system referenced
 * elsewhere in the project's history, which remains a future milestone.
 */

import { generateId } from '../utils/idGenerator.js';
import { getCurrentIsoDate } from '../utils/dateHelpers.js';

export function logEntry(student, { kind, label, delta = 0 }) {
  if (!student.history) student.history = [];
  const entry = { id: generateId(), kind, label, delta, recordedAt: getCurrentIsoDate() };
  student.history.push(entry);
  if (kind === 'points') student.score += delta;
  return entry;
}

export function logPoints(student, delta, label) {
  return logEntry(student, { kind: 'points', label, delta });
}

/**
 * Most recent entry first. Reverses insertion order rather than sorting
 * by timestamp — entries logged within the same millisecond would
 * otherwise tie and silently fall back to insertion order for just
 * those entries, which looks like a bug (newest-first breaking) even
 * though the log itself is correct.
 */
export function listHistory(student) {
  return [...(student.history || [])].reverse();
}

export function getTotalPositivePoints(student) {
  return (student.history || [])
    .filter((entry) => entry.kind === 'points' && entry.delta > 0)
    .reduce((sum, entry) => sum + entry.delta, 0);
}

/** Returned as a positive magnitude (e.g. 3, not -3) for display. */
export function getTotalNegativePoints(student) {
  const total = (student.history || [])
    .filter((entry) => entry.kind === 'points' && entry.delta < 0)
    .reduce((sum, entry) => sum + entry.delta, 0);
  return Math.abs(total);
}
