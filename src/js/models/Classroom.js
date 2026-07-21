/**
 * models/Classroom.js
 *
 * Describes the shape of a Classroom record. In the Sprint 1 UI this is
 * presented to Fellows as a "Team" — a card grouping a set of students —
 * but the underlying record stays a Classroom/cohort grouping so the
 * model can later represent a real classroom, a team, or any other
 * cohort without a rename. `points` is a cached, derived total kept in
 * sync by eventService (see models/Event.js).
 */

import { generateId } from '../utils/idGenerator.js';

export function createTeam({ id, name, points = 0 } = {}) {
  return {
    id: id || generateId(),
    name,
    points,
  };
}
