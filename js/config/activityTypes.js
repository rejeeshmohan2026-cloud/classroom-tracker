/**
 * config/activityTypes.js
 *
 * The kinds of Learning Activity a teacher can create (see
 * models/LearningActivity.js). Deliberately broader than "Submissions" —
 * anything a student turns in or presents fits here.
 */

export const ACTIVITY_TYPES = Object.freeze([
  'Homework',
  'Worksheet',
  'Quiz',
  'Project',
  'Reading Log',
  'Presentation',
  'Notebook Check',
  'Assignment',
]);
