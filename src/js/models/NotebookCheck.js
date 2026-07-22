/**
 * models/NotebookCheck.js
 *
 * A single Notebook Check — e.g. "Daily Writing" (English, Handwriting).
 * Stored as a map on classroom.notebookChecks, keyed by this factory's
 * self-generated id (same self-generating-id pattern as
 * models/Team.js/models/Student.js) — services/notebookCheckService.js
 * uses the returned `id` as the map key.
 *
 * `submissions` holds every student's record for this check
 * (models/NotebookSubmission.js), keyed by studentId — deliberately NOT
 * stored on the student: this keeps notebook data localized to the
 * feature, keeps student objects from growing without bound, and makes
 * loading one check for the fast-entry screen a single lookup.
 *
 * `checkDate` is when the check was actually performed; `dueDate` is an
 * optional deadline and may differ from it. `status` is this check's own
 * lifecycle (config/notebookStatuses.js's CHECK_STATUS_LABELS) — separate from each
 * student's Submission/Completion status (config/notebookStatuses.js).
 */

import { generateId } from '../utils/idGenerator.js';
import { getCurrentIsoDate } from '../utils/dateHelpers.js';

export function createNotebookCheck({
  id,
  title,
  subjectId,
  notebookTypeId,
  checkDate,
  dueDate = '',
  remarks = '',
  status = 'active',
  submissions = {},
  createdAt,
} = {}) {
  return {
    id: id || generateId(),
    title,
    subjectId,
    notebookTypeId,
    checkDate: checkDate || getCurrentIsoDate(),
    dueDate,
    createdAt: createdAt || getCurrentIsoDate(),
    status,
    remarks,
    submissions,
  };
}
