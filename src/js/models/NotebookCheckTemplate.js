/**
 * models/NotebookCheckTemplate.js
 *
 * A reusable starting point for a frequently-recurring Notebook Check
 * (e.g. "English Handwriting: Daily Writing"), so a teacher doesn't
 * retype the same title/subject/type every time. Stored as a map on
 * classroom.notebookCheckTemplates, keyed by this factory's
 * self-generated id — same pattern as models/NotebookCheck.js.
 * Deliberately has no dates or submissions of its own; creating a check
 * "from a template" (services/notebookCheckService.js's
 * createCheckFromTemplate) copies these fields into a fresh
 * NotebookCheck and leaves checkDate (and optionally dueDate) for the
 * teacher to set.
 */

import { generateId } from '../utils/idGenerator.js';

export function createNotebookCheckTemplate({ id, title, subjectId, notebookTypeId, defaultRemarks = '' } = {}) {
  return {
    id: id || generateId(),
    title,
    subjectId,
    notebookTypeId,
    defaultRemarks,
  };
}
