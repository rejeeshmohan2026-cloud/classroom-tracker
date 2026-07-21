/**
 * services/noteService.js
 *
 * Adds and lists Teacher Notes on a student (see models/Note.js).
 * Notes are small dated cards, not one long free-text field — see the
 * Notes tab in ui/views/StudentProfileView.js. Adding a note also logs
 * a "Teacher Note Added" Timeline entry (see services/timelineService.js).
 */

import { createNote } from '../models/Note.js';
import { logEntry } from './timelineService.js';

export function addNote(student, { teacherName, content }) {
  if (!student.notes) student.notes = [];
  const note = createNote({ teacherName, content });
  student.notes.push(note);
  logEntry(student, { kind: 'note', label: 'Teacher Note Added' });
  return note;
}

/** Most recent note first. */
export function listNotes(student) {
  return [...(student.notes || [])].reverse();
}
