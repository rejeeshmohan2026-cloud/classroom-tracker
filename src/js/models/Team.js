/**
 * models/Team.js
 *
 * Describes the shape of a Team ("group"). A Team belongs to exactly one
 * Classroom and owns a list of Students directly.
 *
 * `color` is a colour id from config/groupColorConfig.js's
 * DEFAULT_GROUP_COLORS (e.g. "blue"), auto-assigned when the team is
 * created and editable later (Setup Wizard Step 3, or Settings > Groups).
 *
 * Team does not carry its own score field — a team's total is always the
 * sum of its students' scores (see services/teamService.js
 * `getTeamScore()`), so there's nothing to keep in sync when a student's
 * score changes.
 */

import { generateId } from '../utils/idGenerator.js';

export function createTeam({ id, name, color = null, students = [] } = {}) {
  return {
    id: id || generateId(),
    name,
    color,
    students,
  };
}
