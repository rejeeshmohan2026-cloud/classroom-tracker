/**
 * models/Classroom.js
 *
 * Describes the shape of a Classroom — the top-level entity a teacher
 * creates or imports.
 *
 * Fields:
 *   id             - unique identifier
 *   schoolName     - required, e.g. "CHS Kannamapet"
 *   gradeSection   - required, e.g. "Grade 8A", "Science Club"
 *   classroomName  - optional, a teacher-defined friendly name, e.g.
 *                    "Bloom Force 19". Shown prominently throughout the
 *                    app when present (see classroomService.getDisplayName);
 *                    falls back to gradeSection when absent.
 *   academicYear   - optional, e.g. "2026–27"
 *   description    - optional free-text notes
 *   createdAt      - ISO date string
 *   administrators - Member[] (see models/Member.js) who can delete the
 *                    classroom, remove administrators, and transfer
 *                    ownership
 *   teachers       - Member[] who can award points, undo, reset, import
 *                    rosters, edit students/groups, and invite teachers
 *   teams          - Team[] (see models/Team.js)
 *   settings       - free-form classroom-level settings, empty for now
 */

import { generateId } from '../utils/idGenerator.js';
import { getCurrentIsoDate } from '../utils/dateHelpers.js';

export function createClassroom({
  id,
  schoolName,
  gradeSection,
  classroomName = '',
  academicYear = '',
  description = '',
  createdAt,
  administrators = [],
  teachers = [],
  teams = [],
  settings = {},
} = {}) {
  return {
    id: id || generateId(),
    schoolName,
    gradeSection,
    classroomName,
    academicYear,
    description,
    createdAt: createdAt || getCurrentIsoDate(),
    administrators,
    teachers,
    teams,
    settings,
  };
}
