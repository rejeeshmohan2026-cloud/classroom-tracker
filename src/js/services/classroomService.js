/**
 * services/classroomService.js
 *
 * Holds the in-memory list of Classrooms for the current Workspace and
 * exposes classroom-level operations (create, rename, delete, list).
 * workspaceService is responsible for loading/persisting this list via
 * storage — this module only manages it in memory and builds new
 * Classroom records.
 */

import { createClassroom } from '../models/Classroom.js';
import { createTeam } from '../models/Team.js';
import { createStudent } from '../models/Student.js';

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
 */
export function createEmptyClassroom(name) {
  const classroom = createClassroom({ name });
  classrooms.push(classroom);
  return classroom;
}

/**
 * Creates a classroom from parsed CSV team/student names (see
 * services/classroomImportService.js), with every score starting at
 * zero. Used by the "Import Classroom" path.
 */
export function createClassroomFromImport(name, teamsWithStudentNames) {
  const teams = teamsWithStudentNames.map((teamDef) =>
    createTeam({
      name: teamDef.name,
      students: teamDef.students.map((studentName) =>
        createStudent({ name: studentName })
      ),
    })
  );

  const classroom = createClassroom({ name, teams });
  classrooms.push(classroom);
  return classroom;
}

export function renameClassroom(id, newName) {
  const classroom = getClassroomById(id);
  if (classroom) classroom.name = newName;
  return classroom;
}

export function deleteClassroom(id) {
  const before = classrooms.length;
  classrooms = classrooms.filter((classroom) => classroom.id !== id);
  return classrooms.length < before;
}

/** Total number of students across every team in a classroom. */
export function getStudentCount(classroom) {
  return classroom.teams.reduce((sum, team) => sum + team.students.length, 0);
}

/** Total number of members (administrators + teachers) in a classroom. */
export function getMemberCount(classroom) {
  return classroom.administrators.length + classroom.teachers.length;
}
