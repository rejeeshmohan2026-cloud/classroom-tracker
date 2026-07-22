/**
 * services/notebookCheckService.js
 *
 * Notebook Checks are created once at the classroom level (e.g.
 * "English Handwriting: Daily Writing"), then every student gets a
 * Submission + Completion status against it — matching the same
 * "create once, mark the whole roster from one screen" workflow
 * Learning Activities already uses. Submissions live on the check
 * itself (notebookChecks[id].submissions[studentId]), not on the
 * student, so a check stays self-contained and student records don't
 * grow with every check ever created.
 *
 * `submission` and `completion` are independent axes — this service
 * never infers one from the other (see config/notebookStatuses.js).
 */

import { createNotebookCheck } from '../models/NotebookCheck.js';
import { createNotebookCheckTemplate } from '../models/NotebookCheckTemplate.js';
import { createNotebookSubmission } from '../models/NotebookSubmission.js';

// ---------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------

export function listChecks(classroom, { includeArchived = false } = {}) {
  const checks = Object.entries(classroom.notebookChecks).map(([id, check]) => ({ id, ...check }));
  return includeArchived ? checks : checks.filter((check) => check.status !== 'archived');
}

export function getCheckById(classroom, checkId) {
  const check = classroom.notebookChecks[checkId];
  return check ? { id: checkId, ...check } : null;
}

export function createCheck(classroom, { title, subjectId, notebookTypeId, checkDate, dueDate, remarks }) {
  const check = createNotebookCheck({ title, subjectId, notebookTypeId, checkDate, dueDate, remarks });
  classroom.notebookChecks[check.id] = check;
  return { id: check.id, ...check };
}

export function updateCheckStatus(classroom, checkId, status) {
  const check = classroom.notebookChecks[checkId];
  if (check) check.status = status;
  return check;
}

export function deleteCheck(classroom, checkId) {
  const existed = Boolean(classroom.notebookChecks[checkId]);
  delete classroom.notebookChecks[checkId];
  return existed;
}

// ---------------------------------------------------------------------
// Submissions (per student, per check)
// ---------------------------------------------------------------------

/** This student's current submission record for one check, or null if never set. */
export function getSubmission(classroom, checkId, studentId) {
  return classroom.notebookChecks[checkId]?.submissions?.[studentId] || null;
}

/**
 * Sets one student's Submission and/or Completion status for one check.
 * `updates` may include either or both of {submission, completion,
 * remarks} — whichever isn't passed keeps its current value. Stamps
 * `audit` (createdBy on first write, updatedBy/updatedAt every time) —
 * see models/NotebookSubmission.js.
 */
export function setSubmission(classroom, checkId, studentId, updates, actingUid) {
  const check = classroom.notebookChecks[checkId];
  if (!check) return null;

  const existing = check.submissions[studentId];

  check.submissions[studentId] = createNotebookSubmission(
    {
      submission: updates.submission !== undefined ? updates.submission : existing?.submission ?? null,
      completion: updates.completion !== undefined ? updates.completion : existing?.completion ?? null,
      remarks: updates.remarks !== undefined ? updates.remarks : existing?.remarks ?? '',
      audit: existing?.audit
        ? { ...existing.audit, updatedBy: actingUid, updatedAt: new Date().toISOString() }
        : null,
    },
    actingUid
  );

  return check.submissions[studentId];
}

/**
 * This student's full Notebook history across every check in the
 * classroom, grouped by (subject, notebook type) — matching the
 * Student Profile's Notebooks tab layout. Iterates every check (rather
 * than one student's own record) since submissions live on the check,
 * not the student.
 */
export function getStudentNotebookHistory(classroom, studentId) {
  const groups = new Map(); // "subjectId::typeId" -> { subjectId, notebookTypeId, entries: [] }

  Object.entries(classroom.notebookChecks).forEach(([checkId, check]) => {
    const submission = check.submissions?.[studentId];
    if (!submission) return;

    const groupKey = `${check.subjectId}::${check.notebookTypeId}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, { subjectId: check.subjectId, notebookTypeId: check.notebookTypeId, entries: [] });
    }

    groups.get(groupKey).entries.push({
      checkId,
      title: check.title,
      checkDate: check.checkDate,
      submission: submission.submission,
      completion: submission.completion,
      remarks: submission.remarks,
    });
  });

  // Most recent check first within each group.
  groups.forEach((group) => {
    group.entries.sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate));
  });

  return Array.from(groups.values());
}

/** % of the roster with submission === 'submitted' for one check — ready for future Group Stars rules. */
export function getSubmissionSummary(classroom, checkId) {
  const check = classroom.notebookChecks[checkId];
  if (!check) return { total: 0, submitted: 0, percent: 0 };

  const allStudentIds = classroom.teams.flatMap((team) => team.students.map((student) => student.id));
  const submittedCount = allStudentIds.filter((id) => check.submissions?.[id]?.submission === 'submitted').length;

  return {
    total: allStudentIds.length,
    submitted: submittedCount,
    percent: allStudentIds.length === 0 ? 0 : Math.round((submittedCount / allStudentIds.length) * 100),
  };
}

// ---------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------

export function listTemplates(classroom) {
  return Object.entries(classroom.notebookCheckTemplates).map(([id, template]) => ({ id, ...template }));
}

export function createTemplate(classroom, { title, subjectId, notebookTypeId, defaultRemarks }) {
  const template = createNotebookCheckTemplate({ title, subjectId, notebookTypeId, defaultRemarks });
  classroom.notebookCheckTemplates[template.id] = template;
  return { id: template.id, ...template };
}

export function deleteTemplate(classroom, templateId) {
  const existed = Boolean(classroom.notebookCheckTemplates[templateId]);
  delete classroom.notebookCheckTemplates[templateId];
  return existed;
}

/** Creates a new, active check pre-filled from a template; checkDate defaults to today. */
export function createCheckFromTemplate(classroom, templateId, { checkDate, dueDate } = {}) {
  const template = classroom.notebookCheckTemplates[templateId];
  if (!template) return null;

  return createCheck(classroom, {
    title: template.title,
    subjectId: template.subjectId,
    notebookTypeId: template.notebookTypeId,
    checkDate,
    dueDate,
    remarks: template.defaultRemarks,
  });
}
