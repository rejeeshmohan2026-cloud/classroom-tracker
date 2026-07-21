/**
 * models/Team.js
 *
 * Describes the shape of a Team (previously modelled as a "Classroom"
 * before this refactor — see docs/problem-statement.md and the Sprint 1
 * history in CONTRIBUTING.md for that earlier naming). A Team belongs to
 * exactly one Classroom and owns a list of Students directly; there is no
 * separate flat student list with a foreign key back to the team.
 *
 * Team does not carry its own score field — a team's total is always the
 * sum of its students' scores (see services/teamService.js
 * `getTeamScore()`), so there's nothing to keep in sync when a student's
 * score changes.
 */

import { generateId } from '../utils/idGenerator.js';

export function createTeam({ id, name, students = [] } = {}) {
  return {
    id: id || generateId(),
    name,
    students,
  };
}
