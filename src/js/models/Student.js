/**
 * models/Student.js
 *
 * Describes the shape of a Student record. `points` is a cached, derived
 * total kept in sync by eventService as Events are recorded and undone —
 * the Event log remains the source of truth (see models/Event.js).
 */

import { generateId } from '../utils/idGenerator.js';

export function createStudent({ id, name, teamId, points = 0 } = {}) {
  return {
    id: id || generateId(),
    name,
    teamId,
    points,
  };
}
