/**
 * models/Student.js
 *
 * Describes the shape of a Student record — the central entity of the
 * app. Students live nested inside their Team's `students` array (see
 * models/Team.js).
 *
 * Fields:
 *   score       - current session score, adjusted by timeline entries
 *                 (see services/timelineService.js)
 *   bucket      - one of config/bucketConfig.js's BUCKET_KEYS ('green' /
 *                 'yellow' / 'red') or null, displayed as "Not Assigned"
 *                 when null. Always optional, including on import.
 *   badges      - names of Behaviour Badges currently awarded (see
 *                 services/badgeService.js); drawn from the classroom's
 *                 badge catalog
 *   notes       - Note[] (see models/Note.js) — a chronological log of
 *                 short dated notes, not one long free-text field
 *   submissions - { [learningActivityId]: { status, feedback, score,
 *                 updatedAt } } — this student's status against each of
 *                 the classroom's Learning Activities (see
 *                 models/LearningActivity.js and
 *                 services/learningActivityService.js). An activity with
 *                 no entry here is "Not Assigned" for this student.
 *   history     - the Timeline: an array of { id, kind, label, delta,
 *                 recordedAt } entries (see services/timelineService.js).
 *                 This is the append-only log `score` is derived from,
 *                 matching the event-driven approach used elsewhere.
 */

import { generateId } from '../utils/idGenerator.js';

export function createStudent({
  id,
  name,
  score = 0,
  bucket = null,
  badges = [],
  notes = [],
  submissions = {},
  history = [],
} = {}) {
  return {
    id: id || generateId(),
    name,
    score,
    bucket,
    badges,
    notes,
    submissions,
    history,
  };
}
