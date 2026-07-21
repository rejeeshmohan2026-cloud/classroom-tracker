/**
 * models/Classroom.js
 *
 * Describes the shape of a Classroom — the top-level entity a teacher
 * creates or imports. A Classroom owns its own teams, its own members
 * (administrators/teachers), and its own settings, so classrooms are
 * fully independent of one another. This is the shape Firebase will
 * eventually sync per-document; nothing here assumes local-only storage.
 *
 * Fields:
 *   id             - unique identifier
 *   name           - display name, e.g. "Class VIII-A"
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
  name,
  createdAt,
  administrators = [],
  teachers = [],
  teams = [],
  settings = {},
} = {}) {
  return {
    id: id || generateId(),
    name,
    createdAt: createdAt || getCurrentIsoDate(),
    administrators,
    teachers,
    teams,
    settings,
  };
}
