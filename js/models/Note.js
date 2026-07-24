/**
 * models/Note.js
 *
 * A single Teacher Note on a student — a small dated record rather than
 * one long free-text field, so notes read as a chronological log (see
 * services/noteService.js). `teacherName` is free text, not a link to
 * models/Member.js — there's no login yet, so the app can't know who's
 * actually typing; a teacher just types their own name each time.
 */

import { generateId } from '../utils/idGenerator.js';
import { getCurrentIsoDate } from '../utils/dateHelpers.js';

export function createNote({ id, teacherName = '', content, createdAt } = {}) {
  return {
    id: id || generateId(),
    teacherName,
    content,
    createdAt: createdAt || getCurrentIsoDate(),
  };
}
