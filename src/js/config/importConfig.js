/**
 * config/importConfig.js
 *
 * Configuration for parsing a teacher's classroom spreadsheet (CSV) into
 * a roster of teams and students. Kept separate from appConfig.js since
 * these rules are specific to the import feature (Sprint 1A) and may need
 * to change independently as real spreadsheet formats are tested.
 */

// Matches a header cell like "Group A", "Group B", "Group C", or "Group D"
// (case-insensitive). This is the row the importer treats as the
// group-name row; everything above it, column by column, is a student.
export const GROUP_LABEL_PATTERN = /^group [a-d]$/i;

// Row labels to ignore anywhere above the group-name row — these are
// spreadsheet sections (running totals, weekly summaries, a legend, etc.),
// not student rows. Compared case-insensitively against any cell in the
// row; a match causes the whole row to be skipped.
export const IMPORT_IGNORE_LABELS = [
  'overall',
  'this week',
  'daily history',
  'bucket legend',
];
