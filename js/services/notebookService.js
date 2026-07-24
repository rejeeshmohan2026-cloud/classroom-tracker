/**
 * services/notebookService.js
 *
 * Notebook Tracker's register: no discrete "check" entity anymore — a
 * teacher opens a notebook (Subject → Notebook Type), today's date is
 * selected automatically, and marking a student writes directly under
 * that date (see models/Classroom.js's `notebooks` field).
 *
 * This file owns ONLY reading and writing notebook history — no
 * completion percentages, streaks, or other derived metrics live here.
 * That's services/studentProgressService.js's job, which consumes
 * getStudentHistory() below and nothing else about this schema. Reports,
 * a future dashboard, and Star Performer should all eventually go
 * through studentProgressService, not query this file's data shape
 * directly, so there's exactly one calculation engine across the app:
 *
 *   Notebook Service -> Student Progress Service -> Dashboard / Reports /
 *   Student Profile / Star Performer
 *
 * `submission` and `completion` are independent axes — this service
 * never infers one from the other (see config/notebookStatuses.js).
 */

import { createNotebookSubmission } from '../models/NotebookSubmission.js';

// ---------------------------------------------------------------------
// Reading and writing the register
// ---------------------------------------------------------------------

export function getEntry(classroom, subjectId, notebookTypeId, dateKey, studentId) {
  return classroom.notebooks?.[subjectId]?.[notebookTypeId]?.[dateKey]?.[studentId] || null;
}

/** Every student's entry for one notebook, on one date — the Register View's roster data. */
export function getRegisterForDate(classroom, subjectId, notebookTypeId, dateKey) {
  return classroom.notebooks?.[subjectId]?.[notebookTypeId]?.[dateKey] || {};
}

/**
 * Sets one student's Submission and/or Completion for one notebook, on
 * one date. `updates` may include either or both of {submission,
 * completion} — whichever isn't passed keeps its current value. Stamps
 * `audit` (createdBy on first write, updatedBy/updatedAt every time) —
 * see models/NotebookSubmission.js.
 */
export function setEntry(classroom, subjectId, notebookTypeId, dateKey, studentId, updates, actingUid) {
  if (!classroom.notebooks) classroom.notebooks = {};
  if (!classroom.notebooks[subjectId]) classroom.notebooks[subjectId] = {};
  if (!classroom.notebooks[subjectId][notebookTypeId]) classroom.notebooks[subjectId][notebookTypeId] = {};
  if (!classroom.notebooks[subjectId][notebookTypeId][dateKey]) {
    classroom.notebooks[subjectId][notebookTypeId][dateKey] = {};
  }

  const dateEntries = classroom.notebooks[subjectId][notebookTypeId][dateKey];
  const existing = dateEntries[studentId];

  dateEntries[studentId] = createNotebookSubmission(
    {
      submission: updates.submission !== undefined ? updates.submission : existing?.submission ?? null,
      completion: updates.completion !== undefined ? updates.completion : existing?.completion ?? null,
      audit: existing?.audit
        ? { ...existing.audit, updatedBy: actingUid, updatedAt: new Date().toISOString() }
        : null,
    },
    actingUid
  );

  return dateEntries[studentId];
}

/**
 * This student's full history for one notebook, oldest first — the one
 * function services/studentProgressService.js (and, later, any report or
 * dashboard) should build on rather than reading `classroom.notebooks`
 * directly.
 */
export function getStudentHistory(classroom, subjectId, notebookTypeId, studentId) {
  const dates = classroom.notebooks?.[subjectId]?.[notebookTypeId] || {};
  const history = [];

  Object.keys(dates).forEach((dateKey) => {
    const entry = dates[dateKey][studentId];
    if (entry) history.push({ dateKey, ...entry });
  });

  history.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return history;
}

/** % of the roster marked "submitted" for one notebook, on one date — ready for future Group Stars rules. */
export function getRegisterSummary(classroom, subjectId, notebookTypeId, dateKey) {
  const dateEntries = getRegisterForDate(classroom, subjectId, notebookTypeId, dateKey);
  const allStudentIds = classroom.teams.flatMap((team) => team.students.map((student) => student.id));
  const submittedCount = allStudentIds.filter((id) => dateEntries[id]?.submission === 'submitted').length;

  return {
    total: allStudentIds.length,
    submitted: submittedCount,
    percent: allStudentIds.length === 0 ? 0 : Math.round((submittedCount / allStudentIds.length) * 100),
  };
}

// ---------------------------------------------------------------------
// Migration (Option A — non-destructive)
// ---------------------------------------------------------------------

/**
 * One-time, non-destructive fold of the previous discrete-check schema
 * (classroom.notebookChecks) into the new day-by-day register
 * (classroom.notebooks), using each check's own checkDate as the date
 * key. Legacy fields are left in place, untouched — nothing is deleted,
 * so there is zero data-loss risk even if this needs to be re-examined
 * later.
 *
 * Self-limiting rather than flag-guarded: it only runs when `notebooks`
 * is still empty AND there's legacy data to fold, so calling this on
 * every classroom load (see services/classroomService.js's
 * normalizeClassroom) is safe and cheap — once folded, `notebooks` is no
 * longer empty and this becomes a no-op every time after.
 */
export function migrateLegacyChecksIfNeeded(classroom) {
  const alreadyHasRegisterData = Object.keys(classroom.notebooks || {}).length > 0;
  const legacyChecks = Object.values(classroom.notebookChecks || {});

  if (alreadyHasRegisterData || legacyChecks.length === 0) return;

  legacyChecks.forEach((check) => {
    const dateKey = (check.checkDate || '').slice(0, 10);
    if (!dateKey || !check.subjectId || !check.notebookTypeId) return;

    if (!classroom.notebooks[check.subjectId]) classroom.notebooks[check.subjectId] = {};
    if (!classroom.notebooks[check.subjectId][check.notebookTypeId]) {
      classroom.notebooks[check.subjectId][check.notebookTypeId] = {};
    }

    // Reconstruct each entry through the current, clean shape —
    // deliberately drops any legacy `remarks` string field rather than
    // carrying it forward, since the new model doesn't support it yet
    // (see models/NotebookSubmission.js).
    const cleanedEntries = {};
    Object.entries(check.submissions || {}).forEach(([studentId, entry]) => {
      cleanedEntries[studentId] = {
        submission: entry.submission ?? null,
        completion: entry.completion ?? null,
        audit: entry.audit || null,
      };
    });

    classroom.notebooks[check.subjectId][check.notebookTypeId][dateKey] = cleanedEntries;
  });
}

/**
 * Clears the entire day-by-day register — every subject, every
 * notebook type, every date, every student's submission/completion
 * entry — for a comprehensive classroom reset (see
 * services/studentService.js's resetAllStudentData(), the per-student
 * counterpart to this). Deliberately does not touch notebookConfig
 * (the subject/notebook-type taxonomy itself) — that's classroom
 * configuration, not accumulated data.
 */
export function clearAllNotebookData(classroom) {
  classroom.notebooks = {};
}
