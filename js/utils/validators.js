/**
 * utils/validators.js
 *
 * Small, dependency-free input validation helpers used across services
 * and the UI layer.
 */

import { ACTION_TYPES } from '../config/actionTypes.js';

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEventType(type) {
  return Object.values(ACTION_TYPES).includes(type);
}

export function isValidDateString(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}
