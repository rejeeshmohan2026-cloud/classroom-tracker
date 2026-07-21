/**
 * utils/dateHelpers.js
 *
 * Small, dependency-free date formatting and parsing helpers used across
 * services and the UI layer.
 */

export function getCurrentIsoDate() {
  return new Date().toISOString();
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function isSameDay(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return a.toDateString() === b.toDateString();
}
