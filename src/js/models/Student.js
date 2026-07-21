/**
 * models/Student.js
 *
 * Describes the shape of a Student record: an id, a name, and a score.
 * Students live nested inside their Team's `students` array (see
 * models/Team.js) rather than in a flat list with a team-id foreign key.
 *
 * `score` always starts at zero, including for imported rosters (see
 * services/classroomImportService.js) — awarding points is a future
 * milestone (see docs/problem-statement.md), not part of this refactor.
 */

import { generateId } from '../utils/idGenerator.js';

export function createStudent({ id, name, score = 0 } = {}) {
  return {
    id: id || generateId(),
    name,
    score,
  };
}
