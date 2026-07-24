/**
 * services/importFormats/studentListFormat.js
 *
 * "Student List" import format: a header row with "Student Name" and
 * "Group" columns (in either order), one student per row. A blank Group
 * cell puts that student in "Ungrouped" rather than being dropped.
 *
 * Also optionally detects a "Bucket" column (Green / Yellow / Red) — see
 * config/bucketConfig.js. If present, `parse()` returns a
 * { studentName: bucketKey } map alongside the teams, so the Setup
 * Wizard's Assign Learning Buckets step can offer to import it rather
 * than silently applying it (Learning Buckets are always optional).
 */

import { BUCKET_KEYS } from '../../config/bucketConfig.js';
import { ClassroomImportError } from './importErrors.js';

export const id = 'studentList';
export const label = 'Student List \u2014 Student Name + Group columns';

const UNGROUPED_TEAM_NAME = 'Ungrouped';

function findHeaderColumns(row) {
  if (!row) return null;

  let nameColumn = -1;
  let groupColumn = -1;
  let bucketColumn = -1;

  row.forEach((cell, index) => {
    const normalized = cell.trim().toLowerCase();
    if (normalized === 'student name' || normalized === 'name') nameColumn = index;
    if (normalized === 'group') groupColumn = index;
    if (normalized === 'bucket') bucketColumn = index;
  });

  if (nameColumn === -1 || groupColumn === -1) return null;
  return { nameColumn, groupColumn, bucketColumn };
}

export function detect(rows) {
  const header = findHeaderColumns(rows[0]);
  if (!header) return { matches: false, confidence: 0 };
  return { matches: true, confidence: 0.95 };
}

export function parse(rows) {
  const header = findHeaderColumns(rows[0]);
  if (!header) {
    throw new ClassroomImportError(
      'Could not find "Student Name" and "Group" columns in the header row.'
    );
  }

  const teamsByName = new Map();
  const buckets = {};

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row || row.every((cell) => !cell || cell.length === 0)) continue;

    const name = (row[header.nameColumn] || '').trim();
    if (!name) continue;

    const groupName = (row[header.groupColumn] || '').trim() || UNGROUPED_TEAM_NAME;
    if (!teamsByName.has(groupName)) teamsByName.set(groupName, []);
    teamsByName.get(groupName).push(name);

    if (header.bucketColumn !== -1) {
      const bucketRaw = (row[header.bucketColumn] || '').trim().toLowerCase();
      if (BUCKET_KEYS.includes(bucketRaw)) {
        buckets[name] = bucketRaw;
      }
    }
  }

  const teams = Array.from(teamsByName.entries()).map(([name, students]) => ({ name, students }));

  const totalStudents = teams.reduce((sum, team) => sum + team.students.length, 0);
  if (totalStudents === 0) {
    throw new ClassroomImportError('No students were found under the Student Name column.');
  }

  return { teams, buckets };
}
