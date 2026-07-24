/**
 * services/setupProgressService.js
 *
 * Reads and updates a classroom's Setup Wizard progress (see
 * config/classroomDefaults.js for the step keys and defaults). A step
 * only gets marked done when the teacher actually completes it —
 * skipping a step advances the wizard without marking it done, so the
 * progress percentage stays an honest reflection of what's actually been
 * set up (teachers are never forced through every step, but the
 * checklist doesn't pretend a skipped step is finished either).
 */

import { PROGRESS_STEP_KEYS } from '../config/classroomDefaults.js';

export function isStepDone(classroom, stepKey) {
  return Boolean(classroom.settings.setupProgress?.[stepKey]);
}

export function markStepDone(classroom, stepKey) {
  if (!classroom.settings.setupProgress) classroom.settings.setupProgress = {};
  classroom.settings.setupProgress[stepKey] = true;
}

export function computeProgressPercent(classroom) {
  const total = PROGRESS_STEP_KEYS.length;
  const done = PROGRESS_STEP_KEYS.filter((key) => isStepDone(classroom, key)).length;
  return Math.round((done / total) * 100);
}

export function isSetupComplete(classroom) {
  return PROGRESS_STEP_KEYS.every((key) => isStepDone(classroom, key));
}
