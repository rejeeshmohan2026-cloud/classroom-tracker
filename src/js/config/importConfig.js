/**
 * config/importConfig.js
 *
 * Configuration for the "Teamed" import format (see
 * services/importFormats/teamedFormat.js) — one of several supported
 * roster layouts, see services/importFormats/formatRegistry.js for the
 * full list.
 */

// Matches a header cell like "Group A", "Group B", or "Group Falcons"
// (case-insensitive, any label after "Group "). This is the row the
// Teamed format treats as the group-name row; everything above it, column
// by column, is a student.
export const GROUP_LABEL_PATTERN = /^group\s+\S.*/i;

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
