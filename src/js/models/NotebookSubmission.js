/**
 * models/NotebookSubmission.js
 *
 * One student's record for one notebook, on one day — lives at
 * notebooks[subjectId][notebookTypeId][dateKey][studentId] (see
 * models/Classroom.js).
 *
 * `submission` and `completion` are independent axes (see
 * config/notebookStatuses.js): a student can be `not_submitted` with
 * `completion: null` ("nothing to assess"), or `submitted` with any
 * completion value. Neither is ever inferred from the other.
 *
 * Deliberately does NOT include a remarks field. Teacher remarks are a
 * separate future feature that may need to support text, photos,
 * attachments, or voice notes — adding a plain string here now would
 * lock the shape into something too simple to extend later.
 *
 * `audit` tracks who touched this record and when — `createdBy` is set
 * once, on the first write; `updatedBy`/`updatedAt` change on every
 * subsequent edit. This is what makes the design ready for multiple
 * teachers checking the same classroom's notebooks.
 */

import { getCurrentIsoDate } from '../utils/dateHelpers.js';

export function createNotebookSubmission({ submission = null, completion = null, audit = null } = {}, actingUid) {
  const now = getCurrentIsoDate();
  return {
    submission,
    completion,
    audit: audit || { createdBy: actingUid, updatedBy: actingUid, updatedAt: now },
  };
}
