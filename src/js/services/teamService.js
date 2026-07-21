/**
 * services/teamService.js
 *
 * Operations on the Teams that belong to a single Classroom. Teams live
 * nested inside `classroom.teams` (see models/Team.js), so every function
 * here takes the classroom it should operate on rather than holding its
 * own module-level list.
 */

import { createTeam } from '../models/Team.js';

export function getTeamById(classroom, teamId) {
  return classroom.teams.find((team) => team.id === teamId) || null;
}

export function addTeam(classroom, name) {
  const team = createTeam({ name });
  classroom.teams.push(team);
  return team;
}

export function renameTeam(classroom, teamId, newName) {
  const team = getTeamById(classroom, teamId);
  if (team) team.name = newName;
  return team;
}

export function removeTeam(classroom, teamId) {
  const before = classroom.teams.length;
  classroom.teams = classroom.teams.filter((team) => team.id !== teamId);
  return classroom.teams.length < before;
}

/**
 * A team's score is always derived from its students, never stored —
 * see models/Team.js for why.
 */
export function getTeamScore(team) {
  return team.students.reduce((sum, student) => sum + student.score, 0);
}
