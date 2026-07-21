/**
 * services/sessionService.js
 *
 * Orchestrates a Classroom Tracker session: loading a saved session (if
 * one exists), importing a classroom roster from CSV (Sprint 1A),
 * awarding points, undoing the last point, resetting the session, and
 * persisting after every mutation. This is the only module the UI layer
 * talks to — it composes classroomService, studentService, and
 * eventService, and hides storage behind a single load/save boundary
 * (storageAdapter.js / localStorageAdapter.js).
 */

import { STORAGE_KEY } from '../config/appConfig.js';
import { localStorageAdapter } from '../storage/localStorageAdapter.js';
import { generateId } from '../utils/idGenerator.js';
import * as classroomService from './classroomService.js';
import * as studentService from './studentService.js';
import * as eventService from './eventService.js';

function buildStateFromTeams(teamsWithStudents) {
  const teamRecords = teamsWithStudents.map((def) => ({
    id: generateId(),
    name: def.name,
  }));
  classroomService.initTeams(teamRecords);

  const studentRecords = teamsWithStudents.flatMap((def, index) => {
    const teamId = teamRecords[index].id;
    return def.students.map((name) => ({ id: generateId(), name, teamId }));
  });
  studentService.initStudents(studentRecords);

  eventService.clearEvents();
}

function serializeState() {
  return {
    teams: classroomService.listTeams(),
    students: studentService.listStudents(),
    events: eventService.listEvents(),
  };
}

function persist() {
  localStorageAdapter.set(STORAGE_KEY, serializeState());
}

/**
 * Loads a previously saved session from storage, if one exists. If no
 * classroom has been imported yet, returns an empty roster — Sprint 1A
 * removed the hardcoded demo roster in favour of CSV import (see
 * services/classroomImportService.js).
 */
export function init() {
  const saved = localStorageAdapter.get(STORAGE_KEY);
  const hasSavedRoster = Boolean(saved) && Array.isArray(saved.teams) && saved.teams.length > 0;

  if (hasSavedRoster) {
    classroomService.replaceTeams(saved.teams);
    studentService.replaceStudents(saved.students || []);
    eventService.replaceEvents(saved.events || []);
  } else {
    classroomService.replaceTeams([]);
    studentService.replaceStudents([]);
    eventService.clearEvents();
  }

  return getState();
}

/**
 * Replaces the current roster with a freshly imported one (fresh IDs,
 * zeroed points, cleared event log), persists it, and returns the new
 * state. Callers are responsible for confirming with the user first if a
 * classroom is already loaded — see hasClassroom().
 */
export function importClassroom(teamsWithStudents) {
  buildStateFromTeams(teamsWithStudents);
  persist();
  return getState();
}

/**
 * Whether a classroom (any teams at all) is currently loaded. Used by the
 * UI to decide whether to confirm before an import would replace it.
 */
export function hasClassroom() {
  return classroomService.listTeams().length > 0;
}

/**
 * Returns the current teams and students for rendering. Does not touch
 * storage.
 */
export function getState() {
  return {
    teams: classroomService.listTeams(),
    students: studentService.listStudents(),
  };
}

/**
 * Awards one point to the given student (and their team), persists the
 * session, and returns the updated state.
 */
export function awardPoint(studentId) {
  eventService.recordPointEvent(studentId);
  persist();
  return getState();
}

/**
 * Reverses the most recently recorded point-award Event, if any. Persists
 * the session only when an Event was actually undone.
 */
export function undo() {
  const undoneEvent = eventService.undoLastEvent();
  if (undoneEvent) persist();
  return getState();
}

/**
 * Clears all Events and zeroes every student's and team's points, keeping
 * the roster itself intact. Persists the reset session.
 */
export function resetSession() {
  studentService.resetStudentsPoints();
  classroomService.resetTeamsPoints();
  eventService.clearEvents();
  persist();
  return getState();
}

/**
 * Whether there's an Event available to undo. Used by the UI to disable
 * the Undo button when appropriate.
 */
export function canUndo() {
  return eventService.listEvents().length > 0;
}
