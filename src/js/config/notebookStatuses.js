/**
 * config/notebookStatuses.js
 *
 * The fixed vocabularies Notebook Tracker uses:
 *   - SUBMISSION_STATUSES / COMPLETION_STATUSES: the two independent
 *     per-student status axes recorded per notebook, per day (see
 *     models/NotebookSubmission.js and services/notebookService.js).
 *     Deliberately separate from config/submissionStatuses.js (Learning
 *     Activities), which combines timing and submission into one axis —
 *     here Submission and Completion stay genuinely independent (e.g.
 *     Submitted + Incomplete, or Not Submitted with no completion value
 *     set at all).
 *   - NOTEBOOK_TIMELINE_SYMBOLS / deriveDaySymbolKey: the Timeline
 *     View's read-only, at-a-glance rendering collapses the two
 *     independent axes above into a single glyph per day. This is a
 *     presentation concern, not a derived metric (that's
 *     services/studentProgressService.js's job) — kept here as a small,
 *     pure, stateless mapping next to the vocabulary it reads.
 *
 * There is no longer a Notebook Check "lifecycle" (active/completed/
 * archived) — Notebook Tracker moved from discrete, titled check events
 * to a plain day-by-day register (see models/Classroom.js's `notebooks`
 * field), so that concept was removed rather than carried forward.
 */

export const SUBMISSION_STATUSES = Object.freeze(['submitted', 'not_submitted', 'absent']);

export const SUBMISSION_LABELS = Object.freeze({
  submitted: 'Submitted',
  not_submitted: 'Not Submitted',
  absent: 'Absent',
});

// Completion is optional — null means "not assessed yet", distinct from
// any of these four values.
export const COMPLETION_STATUSES = Object.freeze(['complete', 'incomplete', 'late', 'exempt']);

export const COMPLETION_LABELS = Object.freeze({
  complete: 'Complete',
  incomplete: 'Incomplete',
  late: 'Late',
  exempt: 'Exempt',
});

// Timeline symbol vocabulary — a small dot ("not checked") rather than a
// dash, since it reads cleaner across many dates in a row.
export const NOTEBOOK_TIMELINE_SYMBOLS = Object.freeze({
  complete: '\u2705', // ✅
  incomplete: '\ud83d\udfe1', // 🟡
  not_submitted: '\u274c', // ❌
  late: '\u23f0', // ⏰
  absent: '\ud83d\udeab', // 🚫
  not_checked: '\u2022', // •
});

export const NOTEBOOK_TIMELINE_STATUS_LABELS = Object.freeze({
  complete: 'Complete',
  incomplete: 'Incomplete',
  not_submitted: 'Not Submitted',
  late: 'Late',
  absent: 'Absent',
  not_checked: 'Not Checked',
});

/**
 * Collapses one day's entry (independent Submission + Completion) into
 * a single timeline symbol key. Submission problems take priority over
 * Completion detail (an absent or not-submitted day is worth flagging
 * at a glance over how "complete" it was); a submitted-but-not-yet-
 * assessed day (completion still null), and an exempt day, both render
 * as "not checked" — there's no separate glyph for either in the
 * approved symbol set, and both are, in different ways, "nothing to
 * flag yet" for a quick scan.
 */
export function deriveDaySymbolKey(entry) {
  if (!entry) return 'not_checked';
  if (entry.submission === 'absent') return 'absent';
  if (entry.submission === 'not_submitted') return 'not_submitted';
  if (entry.completion === 'late') return 'late';
  if (entry.completion === 'complete') return 'complete';
  if (entry.completion === 'incomplete') return 'incomplete';
  return 'not_checked';
}
