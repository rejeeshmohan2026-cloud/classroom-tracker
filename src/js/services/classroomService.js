/**
 * services/classroomService.js
 *
 * Holds the in-memory list of Classrooms for the current Workspace and
 * exposes classroom-level operations (create, update, delete, list, and
 * importing a roster into an already-created classroom). workspaceService
 * is responsible for loading/persisting this list via storage — this
 * module only manages it in memory and builds new records.
 */

import { createClassroom } from '../models/Classroom.js';
import { createTeam } from '../models/Team.js';
import { createStudent } from '../models/Student.js';
import { getDefaultGroupColor } from '../config/groupColorConfig.js';
import { isNonEmptyString } from '../utils/validators.js';

export class ClassroomValidationError extends Error {}

function validateDetails(details) {
  if (!isNonEmptyString(details?.schoolName)) {
    throw new ClassroomValidationError('School Name is required.');
  }
  if (!isNonEmptyString(details?.gradeSection)) {
    throw new ClassroomValidationError('Grade / Section is required.');
  }
}

let classrooms = [];

export function replaceClassrooms(newClassrooms = []) {
  classrooms = newClassrooms;
  return classrooms;
}

export function listClassrooms() {
  return classrooms;
}

export function getClassroomById(id) {
  return classrooms.find((classroom) => classroom.id === id) || null;
}

/**
 * Creates a classroom with only its details (School Name, Grade /
 * Section required; Classroom Name, Academic Year, Description
 * optional) — no teams or members yet. The Setup Wizard (see
 * ui/views/SetupWizardView.js) handles importing students, buckets,
 * groups, and scoring afterwards, so every classroom is created this
 * same way regardless of how it'll eventually get its roster.
 */
export function createEmptyClassroom(details) {
  validateDetails(details);
  const classroom = createClassroom({ ...details });
  classrooms.push(classroom);
  return classroom;
}

/**
 * Adds teams and students, parsed from a CSV (see
 * services/classroomImportService.js), to an *existing* classroom —
 * used by the Setup Wizard's Import Students step. Every new team gets
 * the next default colour in rotation (see config/groupColorConfig.js);
 * every student starts with score 0 and no bucket assigned (buckets are
 * handled as a separate wizard step, even when the CSV contained bucket
 * data — see services/bucketService.js).
 */
export function importRoster(classroom, teamsWithStudentNames) {
  const startIndex = classroom.teams.length;

  const newTeams = teamsWithStudentNames.map((teamDef, index) =>
    createTeam({
      name: teamDef.name,
      color: getDefaultGroupColor(startIndex + index),
      students: teamDef.students.map((studentName) => createStudent({ name: studentName })),
    })
  );

  classroom.teams.push(...newTeams);
  return newTeams;
}

/**
 * Merges `updates` into an existing classroom's details (schoolName,
 * gradeSection, classroomName, academicYear, description) and
 * re-validates. Throws ClassroomValidationError if the merged result
 * would be missing a required field (e.g. clearing School Name).
 */
export function updateClassroomDetails(id, updates) {
  const classroom = getClassroomById(id);
  if (!classroom) return null;

  const merged = { ...classroom, ...updates };
  validateDetails(merged);
  Object.assign(classroom, updates);
  return classroom;
}

export function deleteClassroom(id) {
  const before = classrooms.length;
  classrooms = classrooms.filter((classroom) => classroom.id !== id);
  return classrooms.length < before;
}

/**
 * The name to show prominently throughout the app: the teacher-defined
 * Classroom Name when one was provided, otherwise the Grade / Section.
 */
export function getDisplayName(classroom) {
  return classroom.classroomName || classroom.gradeSection;
}

/**
 * A secondary line of context to show under the display name — e.g.
 * "Grade 8A • CHS Kannamapet" when a Classroom Name is set (so the grade
 * and school aren't lost), or just the school name when the Grade /
 * Section is already doing double duty as the display name.
 */
export function getDisplaySubtitle(classroom) {
  if (classroom.classroomName) {
    return `${classroom.gradeSection} \u2022 ${classroom.schoolName}`;
  }
  return classroom.schoolName;
}

/** Total number of students across every team in a classroom. */
export function getStudentCount(classroom) {
  return classroom.teams.reduce((sum, team) => sum + team.students.length, 0);
}

/** Total number of members (administrators + teachers) in a classroom. */
export function getMemberCount(classroom) {
  return classroom.administrators.length + classroom.teachers.length;
}
