/**
 * services/classroomImportService.js
 *
 * Facade over the modular import-format system (see
 * services/importFormats/). The app doesn't assume a single CSV layout —
 * it parses the file into rows, asks the format registry which layout
 * looks most likely, and lets the caller (see main.js /
 * ui/components/ImportPreviewModal.js) show that guess to the user,
 * preview the result, and override the format before anything is
 * imported.
 */

import { parseCsv } from '../utils/csvParser.js';
import { detectFormat, listFormats, parseWithFormat } from './importFormats/formatRegistry.js';
import { ClassroomImportError } from './importFormats/importErrors.js';

export { ClassroomImportError, listFormats, parseWithFormat };

/**
 * Parses raw CSV text into rows and detects the most likely format.
 * Returns everything the UI needs to show a preview: the parsed rows
 * (so parseWithFormat can be re-run against a different format without
 * re-reading the file), the detected format, and the full list of
 * formats for a "change format" control.
 */
export function analyzeCsv(csvText) {
  const rows = parseCsv(csvText);
  const detected = detectFormat(rows);
  return { rows, detected, formats: listFormats() };
}
