/**
 * services/eventService.js
 *
 * Business logic for recording and undoing point-award Events within a
 * single classroom — the append-only log this project's event-driven
 * architecture is built around (see models/Event.js). Not wired to the
 * UI yet: this milestone is architecture/foundation only, and awarding
 * points is the next milestone (see docs/problem-statement.md). Kept in
 * a working, importable state now so that next milestone is wiring, not
 * rebuilding.
 *
 * Each classroom keeps its own event log, keyed by classroom id, since
 * the app now supports many classrooms rather than a single session.
 */

import { createEvent } from '../models/Event.js';
import { ACTION_TYPES } from '../config/actionTypes.js';
import { SCORING_CONFIG } from '../config/scoringConfig.js';
import { findStudentInClassroom } from './studentService.js';

const eventLogsByClassroomId = new Map();

function getLog(classroomId) {
  if (!eventLogsByClassroomId.has(classroomId)) {
    eventLogsByClassroomId.set(classroomId, []);
  }
  return eventLogsByClassroomId.get(classroomId);
}

export function recordPointEvent(classroom, studentId) {
  const found = findStudentInClassroom(classroom, studentId);
  if (!found) return null;

  const delta = SCORING_CONFIG[ACTION_TYPES.POINT_AWARDED].weight;
  const event = createEvent({
    type: ACTION_TYPES.POINT_AWARDED,
    classroomId: classroom.id,
    teamId: found.team.id,
    studentId,
    delta,
  });

  getLog(classroom.id).push(event);
  found.student.score += delta;

  return event;
}

export function undoLastEvent(classroom) {
  const log = getLog(classroom.id);
  const event = log.pop();
  if (!event) return null;

  const found = findStudentInClassroom(classroom, event.studentId);
  if (found) found.student.score -= event.delta;

  return event;
}

export function listEvents(classroom) {
  return getLog(classroom.id);
}

export function clearEvents(classroom) {
  eventLogsByClassroomId.set(classroom.id, []);
}
