/**
 * services/importFormats/formatRegistry.js
 *
 * The single place that knows which import formats exist. Each format
 * module exports { id, label, detect(rows), parse(rows) } (see
 * teamedFormat.js, studentListFormat.js, namesOnlyFormat.js) — adding a
 * new CSV layout in the future means writing one more module with that
 * shape and adding it to FORMATS below, without touching
 * classroomImportService.js or any UI code.
 */

import * as teamedFormat from './teamedFormat.js';
import * as studentListFormat from './studentListFormat.js';
import * as namesOnlyFormat from './namesOnlyFormat.js';

const FORMATS = [teamedFormat, studentListFormat, namesOnlyFormat];

export function listFormats() {
  return FORMATS.map((format) => ({ id: format.id, label: format.label }));
}

/**
 * Runs every format's detect() against the parsed rows and returns the
 * highest-confidence match. namesOnlyFormat always matches (as the
 * fallback), so this always returns something.
 */
export function detectFormat(rows) {
  let best = null;

  for (const format of FORMATS) {
    const result = format.detect(rows);
    if (result.matches && (!best || result.confidence > best.confidence)) {
      best = { id: format.id, label: format.label, confidence: result.confidence };
    }
  }

  return best;
}

export function parseWithFormat(formatId, rows) {
  const format = FORMATS.find((candidate) => candidate.id === formatId);
  if (!format) throw new Error(`Unknown import format: ${formatId}`);
  // Every format's parse() returns { teams, buckets } — buckets is an
  // empty object for formats that have no room for bucket data (Teamed,
  // Names Only), or a { studentName: bucketKey } map when Student List
  // detected a Bucket column.
  return format.parse(rows);
}
