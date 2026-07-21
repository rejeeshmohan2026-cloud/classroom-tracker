/**
 * config/bucketConfig.js
 *
 * Learning Buckets are an optional, per-student classification (Green /
 * Yellow / Red) a teacher can assign during or after roster import.
 * Scoring per bucket is configurable per classroom (see
 * config/classroomDefaults.js for the defaults and
 * services/bucketService.js for reading/updating it) — never hardcoded.
 *
 * These three colours are reserved for buckets specifically — see
 * config/groupColorConfig.js, whose default group colours deliberately
 * avoid red/yellow/green so a group's colour is never confused with a
 * student's bucket.
 */

export const BUCKET_KEYS = Object.freeze(['green', 'yellow', 'red']);

export const BUCKET_LABELS = Object.freeze({
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
});

export const BUCKET_DISPLAY_COLORS = Object.freeze({
  green: '#2e7d32',
  yellow: '#f2b705',
  red: '#d64545',
});
