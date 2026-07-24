/**
 * config/badgeConfig.js
 *
 * The starting catalog of reusable Behaviour Badges a teacher can award
 * to a student. Stored per-classroom (classroom.settings.badgeCatalog —
 * see config/classroomDefaults.js), not as a single global list, so a
 * teacher can add or remove badge types for their own classroom via
 * services/badgeService.js without affecting anyone else's.
 */

export const DEFAULT_BADGE_CATALOG = Object.freeze([
  'Helpful',
  'Leadership',
  'Kindness',
  'Team Player',
  'Reading Hero',
  'Critical Thinker',
  'Responsible',
]);
