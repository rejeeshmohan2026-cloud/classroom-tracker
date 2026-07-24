/**
 * config/submissionStatuses.js
 *
 * Per-student status for a single Learning Activity (see
 * models/LearningActivity.js). "Not Assigned" is the default — a status
 * only appears once a teacher explicitly sets one for that student (see
 * services/learningActivityService.js).
 */

export const SUBMISSION_STATUSES = Object.freeze([
  'Not Assigned',
  'Submitted',
  'Submitted Late',
  'Missing',
  'Resubmitted',
]);

// Which statuses count as "outstanding" in a way worth flagging visually.
export const ATTENTION_STATUSES = Object.freeze(['Missing']);
