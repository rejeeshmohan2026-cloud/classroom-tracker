/**
 * models/Student.js
 *
 * Describes the shape of a Student record — the foundation of the
 * Student Profile page. Students live nested inside their Team's
 * `students` array (see models/Team.js).
 *
 * Fields:
 *   score    - current session score, adjusted by participation entries
 *              (see services/participationService.js)
 *   bucket   - one of config/bucketConfig.js's BUCKET_KEYS ('green' /
 *              'yellow' / 'red') or null, displayed as "Not Assigned"
 *              when null. Always optional, including on import.
 *   badges   - names of Behaviour Badges currently awarded (see
 *              services/badgeService.js); drawn from the classroom's
 *              badge catalog, but stored per-student since a badge can be
 *              awarded to some students and not others
 *   notes    - free-text teacher notes about this student
 *   history  - chronological Participation History: an array of
 *              { id, kind: 'points' | 'badge', label, delta, recordedAt }
 *              entries (see services/participationService.js). This is
 *              the append-only log `score` is derived from — matching
 *              the event-driven approach used elsewhere in this app.
 */

import { generateId } from '../utils/idGenerator.js';

export function createStudent({
  id,
  name,
  score = 0,
  bucket = null,
  badges = [],
  notes = '',
  history = [],
} = {}) {
  return {
    id: id || generateId(),
    name,
    score,
    bucket,
    badges,
    notes,
    history,
  };
}
