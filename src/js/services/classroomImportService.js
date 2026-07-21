/**
 * services/classroomImportService.js
 *
 * Converts a teacher's classroom spreadsheet (as CSV text) into a roster
 * of teams and students, ready for sessionService.importClassroom().
 *
 * Detection rules (see config/importConfig.js):
 *   - The row containing "Group A" / "Group B" / "Group C" / "Group D"
 *     header cells marks the group-name row.
 *   - Every non-empty cell above that row, in the same column, is a
 *     student belonging to that column's group.
 *   - Rows that are entirely empty, or that contain a cell matching one
 *     of the ignore labels (Overall, This week, Daily history, Bucket
 *     legend), are skipped entirely.
 *
 * Added in Sprint 1A.
 */

import { parseCsv } from '../utils/csvParser.js';
import { GROUP_LABEL_PATTERN, IMPORT_IGNORE_LABELS } from '../config/importConfig.js';

export class ClassroomImportError extends Error {}

export function parseClassroomCsv(csvText) {
  const rows = parseCsv(csvText);

  const groupRowIndex = rows.findIndex(rowHasGroupLabels);
  if (groupRowIndex === -1) {
    throw new ClassroomImportError(
      'Could not find a row with the Group A / Group B / Group C / Group D headers in this file.'
    );
  }

  const groupColumns = [];
  rows[groupRowIndex].forEach((cell, columnIndex) => {
    if (GROUP_LABEL_PATTERN.test(cell)) {
      groupColumns.push({ columnIndex, name: cell });
    }
  });

  if (groupColumns.length === 0) {
    throw new ClassroomImportError('No group columns were found in the header row.');
  }

  const teams = groupColumns.map(({ columnIndex, name }) => {
    const students = [];
    for (let rowIndex = 0; rowIndex < groupRowIndex; rowIndex++) {
      const row = rows[rowIndex];
      if (!row || isIgnorableRow(row)) continue;

      const cell = row[columnIndex];
      if (cell && cell.length > 0) {
        students.push(cell);
      }
    }
    return { name, students };
  });

  const totalStudents = teams.reduce((sum, team) => sum + team.students.length, 0);
  if (totalStudents === 0) {
    throw new ClassroomImportError(
      'No students were found above the group header row. Check that names sit directly above "Group A/B/C/D".'
    );
  }

  return teams;
}

function rowHasGroupLabels(row) {
  if (!row) return false;
  const matches = row.filter((cell) => GROUP_LABEL_PATTERN.test(cell));
  return matches.length >= 2;
}

function isIgnorableRow(row) {
  const isEmpty = row.every((cell) => !cell || cell.length === 0);
  if (isEmpty) return true;

  return row.some((cell) => IMPORT_IGNORE_LABELS.includes(cell.toLowerCase()));
}
