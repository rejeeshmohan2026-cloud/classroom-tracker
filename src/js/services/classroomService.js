/**
 * services/classroomService.js
 *
 * Holds the in-memory list of Classrooms for the current Workspace and
 * exposes classroom-level operations (create, update, delete, list).
 * workspaceService is responsible for loading/persisting this list via
 * storage — this module only manages it in memory and builds new
 * Classroom records.
 */

import { createClassroom } from '../models/Classroom.js';
import { createTeam } from '../models/Team.js';
import { createStudent } from '../models/Student.js';
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
 * Creates an empty classroom (no teams, no members yet) — the "Create
 * Manually" path from the New Classroom flow. Teams and students are
 * added afterwards via Settings > Groups / Settings > Students.
 *
 * `details` is { schoolName, gradeSection, classroomName?, academicYear?,
 * description? } — throws ClassroomValidationError if a required field
 * is missing.
 */
export function createEmptyClassroom(details) {
  validateDetails(details);
  const classroom = createClassroom({ ...details });
  classrooms.push(classroom);
  return classroom;
}

/**
 * Creates a classroom from parsed CSV team/student names (see
 * services/classroomImportService.js), with every score starting at
 * zero. Used by the "Import Classroom" path. Same `details` shape and
 * validation as createEmptyClassroom().
 */
export function createClassroomFromImport(details, teamsWithStudentNames) {
  validateDetails(details);

  const teams = teamsWithStudentNames.map((teamDef) =>
    createTeam({
      name: teamDef.name,
      students: teamDef.students.map((studentName) =>
        createStudent({ name: studentName })
      ),
    })
  );

  const classroom = createClassroom({ ...details, teams });
  classrooms.push(classroom);
  return classroom;
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
