/**
 * config/appConfig.js
 *
 * General, app-wide configuration. This milestone moves storage from a
 * single-classroom "session" (Sprint 1/1A) to a Workspace holding many
 * classrooms — see models/Workspace.js and services/workspaceService.js.
 */

export const STORAGE_KEY = 'classroom-tracker:workspace';

export const APP_CONFIG = Object.freeze({
  storageKeyPrefix: 'classroom-tracker',
  defaultLocale: 'en-IN',
});
