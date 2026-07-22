/**
 * config/appConfig.js
 *
 * General, app-wide configuration.
 *
 * As of Sprint 5, classroom data lives in Firestore (see
 * repositories/firestoreClassroomRepository.js), not localStorage.
 * LEGACY_STORAGE_KEY is kept only so services/workspaceService.js can
 * find and migrate any classrooms saved locally by an earlier version
 * of this app — new data is never written here.
 */

export const LEGACY_STORAGE_KEY = 'classroom-tracker:workspace';

export function migrationFlagKey(uid) {
  return `classroom-tracker:migrated:${uid}`;
}

export const APP_CONFIG = Object.freeze({
  storageKeyPrefix: 'classroom-tracker',
  defaultLocale: 'en-IN',
});
