/**
 * models/Event.js
 *
 * Describes the shape of an Event record — a single, timestamped
 * occurrence logged against a student (and, by extension, their team and
 * classroom). Events are the core unit of record in this project's
 * event-driven architecture: awarding a point creates an Event; undoing
 * pops the most recent one. A student's `score` is a derived cache kept
 * in sync with this log, not the source of truth itself.
 *
 * Not wired up to any UI yet — this milestone is architecture/UI
 * foundation only. The scoring system (see services/eventService.js)
 * is a future milestone.
 */

import { generateId } from '../utils/idGenerator.js';
import { getCurrentIsoDate } from '../utils/dateHelpers.js';

export function createEvent({ type, classroomId, teamId, studentId, delta }) {
  return {
    id: generateId(),
    type,
    classroomId,
    teamId,
    studentId,
    delta,
    recordedAt: getCurrentIsoDate(),
  };
}
