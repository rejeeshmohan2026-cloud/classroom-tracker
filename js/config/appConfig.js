/**
 * config/appConfig.js
 *
 * General, app-wide configuration.
 *
 * Classroom data lives in Firestore (see
 * repositories/firestoreClassroomRepository.js), not localStorage.
 * LEGACY_STORAGE_KEY is kept only so services/workspaceService.js can
 * find and migrate any classrooms saved locally by an earlier version
 * of this app — new data is never written here. The migration itself is
 * guarded by a Firestore transaction (repository.claimMigration), not a
 * localStorage flag, so it stays account-scoped rather than
 * device-scoped even for this local-data case.
 */

export const LEGACY_STORAGE_KEY = 'classroom-tracker:workspace';

export const APP_CONFIG = Object.freeze({
  storageKeyPrefix: 'classroom-tracker',
  defaultLocale: 'en-IN',
});
