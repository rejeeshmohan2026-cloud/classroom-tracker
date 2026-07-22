/**
 * services/workspaceService.js
 *
 * Orchestrates the Workspace: loading a teacher's classrooms from
 * Firestore in real time, creating/updating/deleting them, and
 * migrating any pre-Firestore local data exactly once. This is the
 * module the UI/router layer talks to for anything workspace- or
 * classroom-level — it never touches Firestore directly, only the
 * repository contract (see repositories/classroomRepository.js), so a
 * future storage provider could be swapped in here without any UI
 * change.
 *
 * Architecture: UI -> workspaceService (here) -> repository -> Firestore.
 *
 * classroomService's in-memory array remains the single source of truth
 * for rendering (unchanged from earlier sprints) — this file's job is
 * keeping that array in sync with Firestore and writing back to it:
 *   - subscribeToClassrooms() keeps it live-updated from Firestore
 *     (including changes made on another signed-in device);
 *   - every mutation below (createClassroom, deleteClassroom, save)
 *     updates the in-memory copy immediately for an instant-feeling UI,
 *     then fires an async, incremental write for just the one
 *     classroom that changed — never the whole workspace — and doesn't
 *     block the UI on that write completing.
 */

import { LEGACY_STORAGE_KEY, migrationFlagKey } from '../config/appConfig.js';
import { localStorageAdapter } from '../storage/localStorageAdapter.js';
import { firestoreClassroomRepository as repository } from '../repositories/firestoreClassroomRepository.js';
import * as classroomService from './classroomService.js';

let currentUid = null;
let unsubscribeSnapshot = null;
let onChangeCallback = null;

async function migrateLocalDataIfNeeded(uid) {
  const flagKey = migrationFlagKey(uid);
  if (localStorageAdapter.get(flagKey)) return;

  const legacyData = localStorageAdapter.get(LEGACY_STORAGE_KEY);
  const legacyClassrooms = Array.isArray(legacyData?.classrooms) ? legacyData.classrooms : [];

  if (legacyClassrooms.length > 0) {
    await Promise.all(legacyClassrooms.map((classroom) => repository.saveClassroom(uid, classroom)));
  }

  // Mark migration complete even if there was nothing to migrate, so we
  // never re-check the (now-irrelevant) local key again on this device.
  localStorageAdapter.set(flagKey, true);
}

function persistClassroom(classroom) {
  if (!currentUid || !classroom) return;
  repository.saveClassroom(currentUid, classroom).catch((error) => {
    console.error('[workspaceService] Failed to save classroom:', error);
  });
}

function persistDelete(classroomId) {
  if (!currentUid) return;
  repository.deleteClassroom(currentUid, classroomId).catch((error) => {
    console.error('[workspaceService] Failed to delete classroom:', error);
  });
}

/**
 * Call once per sign-in. Migrates any legacy local data for this
 * teacher (once), then subscribes to their classrooms in real time.
 * `onChange` fires every time the in-memory classroom list changes —
 * from the live Firestore listener (e.g. an edit made on another
 * device) or immediately after a local write — so the caller can
 * re-render without the user ever needing to refresh manually.
 */
export async function initForUser(uid, onChange) {
  // TEMPORARY DEBUG LOGGING — remove after cross-device investigation.
  console.log('[WORKSPACE]');
  console.log('initForUser UID:', uid);

  stopListening();
  currentUid = uid;
  onChangeCallback = onChange;

  await migrateLocalDataIfNeeded(uid);

  unsubscribeSnapshot = repository.subscribeToClassrooms(
    uid,
    (classrooms) => {
      classroomService.replaceClassrooms(classrooms);
      // TEMPORARY DEBUG LOGGING — remove after cross-device investigation.
      console.log('[WORKSPACE]');
      console.log('Loaded classrooms:', classrooms.length);
      console.log(classrooms.map((c) => c.id));
      onChangeCallback?.();
    },
    (error) => {
      console.error('[workspaceService] Firestore subscription error:', error);
    }
  );
}

/** Call on sign-out. Stops listening and clears the in-memory workspace. */
export function stopListening() {
  unsubscribeSnapshot?.();
  unsubscribeSnapshot = null;
  currentUid = null;
  onChangeCallback = null;
  classroomService.replaceClassrooms([]);
}

export function getState() {
  return { classrooms: classroomService.listClassrooms() };
}

export function getClassroomById(id) {
  return classroomService.getClassroomById(id);
}

export function createClassroom(details) {
  const classroom = classroomService.createEmptyClassroom(details);
  persistClassroom(classroom);
  return classroom;
}

export function importRosterIntoClassroom(classroomId, teamsWithStudentNames) {
  const classroom = classroomService.getClassroomById(classroomId);
  if (!classroom) return null;
  classroomService.importRoster(classroom, teamsWithStudentNames);
  persistClassroom(classroom);
  return classroom;
}

export function updateClassroomDetails(id, updates) {
  const classroom = classroomService.updateClassroomDetails(id, updates);
  if (classroom) persistClassroom(classroom);
  return classroom;
}

export function deleteClassroom(id) {
  const deleted = classroomService.deleteClassroom(id);
  if (deleted) persistDelete(id);
  return deleted;
}

/**
 * Call after any in-place mutation to a classroom object obtained via
 * getClassroomById() (adding a team, awarding a star, adding a note,
 * changing a bucket, etc.) to persist the change. Takes the classroom
 * explicitly — a teacher can have many classrooms loaded at once, and
 * we only want to write the one that actually changed, not the whole
 * workspace.
 */
export function save(classroom) {
  persistClassroom(classroom);
}
