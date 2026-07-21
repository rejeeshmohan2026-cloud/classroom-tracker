/**
 * models/Event.js
 *
 * Describes the shape of an Event record — a single, timestamped
 * occurrence logged against a student (and, by extension, their team).
 * Events are the core unit of record in this project's event-driven
 * architecture: awarding a point creates an Event; undoing pops the most
 * recent one. Student/team `points` totals are a derived cache kept in
 * sync with this log, not the source of truth themselves.
 */

import { generateId } from '../utils/idGenerator.js';
import { getCurrentIsoDate } from '../utils/dateHelpers.js';

export function createEvent({ type, studentId, teamId, delta }) {
  return {
    id: generateId(),
    type,
    studentId,
    teamId,
    delta,
    recordedAt: getCurrentIsoDate(),
  };
}
