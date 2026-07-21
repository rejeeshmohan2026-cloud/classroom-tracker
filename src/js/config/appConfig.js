/**
 * config/appConfig.js
 *
 * General, app-wide configuration: the storage key used to persist a
 * session, and the default demo roster shown on first load.
 */

export const STORAGE_KEY = 'classroom-tracker:session-state';

// Placeholder demo roster only — not real student data. A future sprint
// will add roster management so Fellows can enter their own teams and
// students. See docs/problem-statement.md for data-handling rules.
export const DEFAULT_TEAMS = [
  {
    name: 'Team Falcons',
    students: ['Student A1', 'Student A2', 'Student A3', 'Student A4'],
  },
  {
    name: 'Team Tigers',
    students: ['Student B1', 'Student B2', 'Student B3', 'Student B4'],
  },
  {
    name: 'Team Eagles',
    students: ['Student C1', 'Student C2', 'Student C3', 'Student C4'],
  },
  {
    name: 'Team Panthers',
    students: ['Student D1', 'Student D2', 'Student D3', 'Student D4'],
  },
];

export const APP_CONFIG = Object.freeze({
  storageKeyPrefix: 'classroom-tracker',
  defaultLocale: 'en-IN',
});
