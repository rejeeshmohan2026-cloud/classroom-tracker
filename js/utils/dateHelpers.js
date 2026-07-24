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

/**
 * A plain "YYYY-MM-DD" string in local time — the date-key format
 * Notebook Tracker uses (see services/notebookService.js). Deliberately
 * not a full ISO timestamp: the notebook register only ever needs a
 * day's granularity, and a plain date string sorts correctly with
 * ordinary string comparison.
 */
export function getTodayDateKey() {
  return toDateKey(new Date());
}

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Adds (or subtracts, with a negative number) whole days to a "YYYY-MM-DD" key. */
export function shiftDateKey(dateKey, deltaDays) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + deltaDays);
  return toDateKey(date);
}

/** A friendly display string for a "YYYY-MM-DD" key, e.g. "22 Jul 2026". */
export function formatDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** The current "YYYY-MM" key — the Timeline View's default month. */
export function getCurrentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Adds (or subtracts) whole months to a "YYYY-MM" key. */
export function shiftYearMonth(yearMonth, deltaMonths) {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + deltaMonths, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** A friendly label for a "YYYY-MM" key, e.g. "July 2026". */
export function formatYearMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/** How many days are in a "YYYY-MM" key's month. */
export function getDaysInYearMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

// ---------------------------------------------------------------------
// Week/month ranges — used by services/studentProgressService.js's
// weekly/monthly calculations. Weeks are Monday-start, matching the
// product decision that "every Monday starts a new opportunity."
// ---------------------------------------------------------------------

/** The "YYYY-MM-DD" key of the Monday on or before the given date. */
export function getMondayStartOfWeek(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const deltaToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + deltaToMonday);
  return toDateKey(date);
}

/**
 * The {start, end} "YYYY-MM-DD" keys (inclusive) of the Monday-start week
 * containing dateKey. Defaults to today's week when no dateKey is given.
 */
export function getWeekRange(dateKey = getTodayDateKey()) {
  const start = getMondayStartOfWeek(dateKey);
  const end = shiftDateKey(start, 6);
  return { start, end };
}

/** The {start, end} "YYYY-MM-DD" keys (inclusive) of the Monday-start week immediately before dateKey's week. */
export function getPreviousWeekRange(dateKey = getTodayDateKey()) {
  const currentStart = getMondayStartOfWeek(dateKey);
  const previousStart = shiftDateKey(currentStart, -7);
  return { start: previousStart, end: shiftDateKey(previousStart, 6) };
}

/** The {start, end} "YYYY-MM-DD" keys (inclusive) of the calendar month containing dateKey. Defaults to the current month. */
export function getMonthRange(dateKey = getTodayDateKey()) {
  const [year, month] = dateKey.split('-').map(Number);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

/** Whether a "YYYY-MM-DD" key falls within an inclusive {start, end} range — plain string comparison, since date keys sort lexicographically. */
export function isDateKeyInRange(dateKey, { start, end }) {
  return dateKey >= start && dateKey <= end;
}
