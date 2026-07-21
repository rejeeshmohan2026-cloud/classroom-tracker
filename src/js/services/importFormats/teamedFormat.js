/**
 * services/importFormats/teamedFormat.js
 *
 * "Teamed" import format: columns represent teams, with a header row of
 * group labels (e.g. "Group A | Group B | Group C") and student names in
 * the cells above it. See config/importConfig.js for the detection
 * pattern and the row labels ignored along the way (Overall, This week,
 * Daily history, Bucket legend, empty rows).
 */

import { GROUP_LABEL_PATTERN, IMPORT_IGNORE_LABELS } from '../../config/importConfig.js';
import { ClassroomImportError } from './importErrors.js';

export const id = 'teamed';
export const label = 'Teamed \u2014 each column is a group';

export function detect(rows) {
  const groupRowIndex = rows.findIndex(rowHasGroupLabels);
  if (groupRowIndex === -1) return { matches: false, confidence: 0 };
  return { matches: true, confidence: 0.9 };
}

export function parse(rows) {
  const groupRowIndex = rows.findIndex(rowHasGroupLabels);
  if (groupRowIndex === -1) {
    throw new ClassroomImportError(
      'Could not find a row of group headers (e.g. "Group A", "Group B") in this file.'
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
      'No students were found above the group header row.'
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
