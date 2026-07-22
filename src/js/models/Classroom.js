/**
 * models/Classroom.js
 *
 * Describes the shape of a Classroom — the top-level entity a teacher
 * creates or imports. Now a *shared* entity: it lives at
 * classrooms/{id} in Firestore (not nested under a single owner's uid),
 * so any member listed in `members` can read and edit it, and every
 * connected member's device sees changes in real time via the same
 * document — never a per-teacher copy (see
 * repositories/firestoreClassroomRepository.js and
 * services/workspaceService.js).
 *
 * Fields:
 *   id             - unique identifier, also the Firestore document id
 *   schoolName     - required, e.g. "CHS Kannamapet"
 *   gradeSection   - required, e.g. "Grade 8A", "Science Club"
 *   classroomName  - optional, a teacher-defined friendly name, e.g.
 *                    "Bloom Force 19". Shown prominently throughout the
 *                    app when present (see classroomService.getDisplayName);
 *                    falls back to gradeSection when absent.
 *   academicYear   - optional, e.g. "2026–27"
 *   description    - optional free-text notes
 *   createdAt      - ISO date string
 *   ownerUid       - the Firebase UID of the classroom's owner (set once,
 *                    at creation; transferring ownership is a future
 *                    feature — see config/memberRoles.js)
 *   members        - { [uid]: { role, displayName, joinedAt } } — real,
 *                    Google-authenticated membership (see
 *                    services/memberService.js). displayName is stored
 *                    here because this app has no way to look up another
 *                    account's profile — only a signed-in user's own
 *                    safe profile (uid/displayName) is ever available.
 *   memberUids     - the same uids as `members`' keys, kept in sync, as
 *                    a plain array. Firestore can't query "which
 *                    documents have my uid as a map key", so this array
 *                    exists purely so security rules and any future
 *                    "classrooms I can access" query can use a simple,
 *                    fast `uid in memberUids` check.
 *   teams          - Team[] (see models/Team.js)
 *   learningActivities - LearningActivity[] (see models/LearningActivity.js),
 *                    created once per classroom; each student then gets
 *                    a status against each one (see models/Student.js)
 *   settings       - classroom-level settings: bucket scoring, point
 *                    scoring, badge catalog, and Setup Wizard progress —
 *                    see config/classroomDefaults.js for the defaults,
 *                    built fresh for every classroom (never a shared
 *                    reference)
 */

import { generateId } from '../utils/idGenerator.js';
import { getCurrentIsoDate } from '../utils/dateHelpers.js';
import { buildDefaultSettings } from '../config/classroomDefaults.js';

export function createClassroom({
  id,
  schoolName,
  gradeSection,
  classroomName = '',
  academicYear = '',
  description = '',
  createdAt,
  ownerUid = null,
  members = {},
  memberUids = [],
  teams = [],
  learningActivities = [],
  settings = buildDefaultSettings(),
} = {}) {
  return {
    id: id || generateId(),
    schoolName,
    gradeSection,
    classroomName,
    academicYear,
    description,
    createdAt: createdAt || getCurrentIsoDate(),
    ownerUid,
    members,
    memberUids,
    teams,
    learningActivities,
    settings,
  };
}
