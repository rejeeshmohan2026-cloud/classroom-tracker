/**
 * services/importFormats/importErrors.js
 *
 * Shared error type for every import format module (see
 * teamedFormat.js, studentListFormat.js, namesOnlyFormat.js) and the
 * classroomImportService.js facade. Kept in its own file so format
 * modules don't need to import the facade (which imports them) to get it.
 */

export class ClassroomImportError extends Error {}
