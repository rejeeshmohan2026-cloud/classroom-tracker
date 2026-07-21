/**
 * services/studentService.js
 *
 * Operations on the Students that belong to a single Team (see
 * models/Team.js). Students live nested inside `team.students`, so every
 * function here takes the team (or classroom, for cross-team lookups/
 * resets) it should operate on.
 */

import { createStudent } from '../models/Student.js';

export function addStudent(team, name) {
  const student = createStudent({ name });
  team.students.push(student);
  return student;
}

export function renameStudent(team, studentId, newName) {
  const student = team.students.find((s) => s.id === studentId);
  if (student) student.name = newName;
  return student;
}

export function removeStudent(team, studentId) {
  const before = team.students.length;
  team.students = team.students.filter((student) => student.id !== studentId);
  return team.students.length < before;
}

/** Finds a student by id across every team in a classroom. */
export function findStudentInClassroom(classroom, studentId) {
  for (const team of classroom.teams) {
    const student = team.students.find((s) => s.id === studentId);
    if (student) return { student, team };
  }
  return null;
}

/** Zeroes every student's score across every team in a classroom. */
export function resetAllScores(classroom) {
  classroom.teams.forEach((team) => {
    team.students.forEach((student) => {
      student.score = 0;
    });
  });
}
