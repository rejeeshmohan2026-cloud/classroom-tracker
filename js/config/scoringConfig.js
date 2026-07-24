/**
 * config/scoringConfig.js
 *
 * Maps each Event type to the point value it contributes. Sprint 1 keeps
 * this simple — one click, one point — but keeping it in config (rather
 * than hardcoded in a service) means the scoring rule can change later
 * without touching business logic.
 */

import { ACTION_TYPES } from './actionTypes.js';

export const SCORING_CONFIG = Object.freeze({
  [ACTION_TYPES.POINT_AWARDED]: { weight: 1 },
});
