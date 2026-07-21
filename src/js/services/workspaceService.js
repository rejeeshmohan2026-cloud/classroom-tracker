/**
 * services/workspaceService.js
 *
 * Orchestrates the Workspace (see models/Workspace.js): loading it from
 * storage on launch, creating classrooms (manually or via CSV import),
 * deleting them, and persisting after every mutation. This is the module
 * the UI/router layer talks to for anything workspace- or classroom-
 * level; per-classroom detail work (teams, students, members) goes
 * through teamService / studentService / memberService directly against
 * the classroom object once it's been fetched from here.
 *
 * Replaces Sprint 1/1A's sessionService.js now that the app supports many
 * classrooms instead of a single active session.
 */

import { STORAGE_KEY } from '../config/appConfig.js';
import { localStorageAdapter } from '../storage/localStorageAdapter.js';
import * as classroomService from './classroomService.js';

function persist() {
  localStorageAdapter.set(STORAGE_KEY, { classrooms: classroomService.listClassrooms() });
}

/**
 * Loads the saved Workspace from storage, if one exists. On first launch
 * (or if storage is empty/corrupt) starts with zero classrooms — there is
 * no demo/dummy data.
 */
export function init() {
  const saved = localStorageAdapter.get(STORAGE_KEY);
  const savedClassrooms = Array.isArray(saved?.classrooms) ? saved.classrooms : [];
  classroomService.replaceClassrooms(savedClassrooms);
  return getState();
}

export function getState() {
  return { classrooms: classroomService.listClassrooms() };
}

export function getClassroomById(id) {
  return classroomService.getClassroomById(id);
}

export function createClassroomManually(details) {
  const classroom = classroomService.createEmptyClassroom(details);
  persist();
  return classroom;
}

export function importClassroom(details, teamsWithStudentNames) {
  const classroom = classroomService.createClassroomFromImport(details, teamsWithStudentNames);
  persist();
  return classroom;
}

export function updateClassroomDetails(id, updates) {
  const classroom = classroomService.updateClassroomDetails(id, updates);
  persist();
  return classroom;
}

export function deleteClassroom(id) {
  const deleted = classroomService.deleteClassroom(id);
  if (deleted) persist();
  return deleted;
}

/**
 * Call after any in-place mutation to a classroom object obtained via
 * getClassroomById() (adding a team, renaming a student, adding a
 * member, etc.) to save the change.
 */
export function save() {
  persist();
}
