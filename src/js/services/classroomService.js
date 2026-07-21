/**
 * services/classroomService.js
 *
 * Business logic for the team roster (backed by models/Classroom.js — see
 * that file for why the model keeps the "Classroom" name). Holds the
 * in-memory list of teams for the current session; sessionService is
 * responsible for loading/persisting this list via storage.
 */

import { createTeam } from '../models/Classroom.js';

let teams = [];

export function initTeams(teamDefs = []) {
  teams = teamDefs.map((def) => createTeam(def));
  return teams;
}

export function replaceTeams(newTeams = []) {
  teams = newTeams;
  return teams;
}

export function listTeams() {
  return teams;
}

export function getTeamById(id) {
  return teams.find((team) => team.id === id) || null;
}

export function addPointsToTeam(id, delta) {
  const team = getTeamById(id);
  if (team) team.points += delta;
  return team;
}

export function resetTeamsPoints() {
  teams.forEach((team) => {
    team.points = 0;
  });
  return teams;
}
