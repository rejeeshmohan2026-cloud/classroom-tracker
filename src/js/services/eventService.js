/**
 * services/eventService.js
 *
 * Business logic for recording and undoing Events — the append-only log
 * this project's event-driven architecture is built around (see
 * models/Event.js). Awarding a point creates an Event and nudges the
 * cached point totals on the affected student/team; undoing pops the
 * most recent Event and reverses that nudge.
 */

import { createEvent } from '../models/Event.js';
import { ACTION_TYPES } from '../config/actionTypes.js';
import { SCORING_CONFIG } from '../config/scoringConfig.js';
import * as studentService from './studentService.js';
import * as classroomService from './classroomService.js';

let events = [];

export function recordPointEvent(studentId) {
  const student = studentService.getStudentById(studentId);
  if (!student) return null;

  const delta = SCORING_CONFIG[ACTION_TYPES.POINT_AWARDED].weight;
  const event = createEvent({
    type: ACTION_TYPES.POINT_AWARDED,
    studentId,
    teamId: student.teamId,
    delta,
  });

  events.push(event);
  studentService.addPointsToStudent(studentId, delta);
  classroomService.addPointsToTeam(student.teamId, delta);

  return event;
}

export function undoLastEvent() {
  const event = events.pop();
  if (!event) return null;

  studentService.addPointsToStudent(event.studentId, -event.delta);
  classroomService.addPointsToTeam(event.teamId, -event.delta);

  return event;
}

export function listEvents() {
  return events;
}

export function replaceEvents(newEvents = []) {
  events = newEvents;
  return events;
}

export function clearEvents() {
  events = [];
  return events;
}
