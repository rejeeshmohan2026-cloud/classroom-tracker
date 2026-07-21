/**
 * services/studentService.js
 *
 * Business logic for the student roster. Holds the in-memory list of
 * students for the current session; sessionService is responsible for
 * loading/persisting this list via storage.
 */

import { createStudent } from '../models/Student.js';

let students = [];

export function initStudents(studentDefs = []) {
  students = studentDefs.map((def) => createStudent(def));
  return students;
}

export function replaceStudents(newStudents = []) {
  students = newStudents;
  return students;
}

export function listStudents() {
  return students;
}

export function listStudentsByTeam(teamId) {
  return students.filter((student) => student.teamId === teamId);
}

export function getStudentById(id) {
  return students.find((student) => student.id === id) || null;
}

export function addPointsToStudent(id, delta) {
  const student = getStudentById(id);
  if (student) student.points += delta;
  return student;
}

export function resetStudentsPoints() {
  students.forEach((student) => {
    student.points = 0;
  });
  return students;
}
