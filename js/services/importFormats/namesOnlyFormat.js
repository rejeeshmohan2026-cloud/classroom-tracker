/**
 * services/importFormats/namesOnlyFormat.js
 *
 * "Names Only" import format: a single column of student names, no group
 * information at all. Every student is imported into one "Ungrouped"
 * team, ready to be split into real groups later via Settings > Groups.
 *
 * This is the ultimate fallback format — its detect() always matches, at
 * the lowest confidence, so any more specific format (Teamed, Student
 * List) wins when it also matches.
 */

import { ClassroomImportError } from './importErrors.js';

export const id = 'namesOnly';
export const label = 'Names Only \u2014 single column, no groups';

const UNGROUPED_TEAM_NAME = 'Ungrouped';
const HEADER_LABELS = ['student name', 'name', 'names'];

export function detect() {
  return { matches: true, confidence: 0.2 };
}

export function parse(rows) {
  const students = [];

  rows.forEach((row, index) => {
    if (!row) return;
    const cell = (row.find((value) => value && value.trim().length > 0) || '').trim();
    if (!cell) return;
    if (index === 0 && HEADER_LABELS.includes(cell.toLowerCase())) return;
    students.push(cell);
  });

  if (students.length === 0) {
    throw new ClassroomImportError('No student names were found in this file.');
  }

  // A single column of names has no room for bucket data either.
  return { teams: [{ name: UNGROUPED_TEAM_NAME, students }], buckets: {} };
}
