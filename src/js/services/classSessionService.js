/**
 * services/classSessionService.js
 *
 * A Class Session is the thing a teacher is actually conducting during
 * Class Mode — not a series of independent database writes. Every
 * action during a session (star, behaviour point, notebook update,
 * recognition) already mutates the in-memory classroom object exactly
 * as it did before this existed (see classModeService.js — unchanged);
 * what changes is that nothing calls workspaceService.save() per
 * action anymore. This service is what turns "a pile of in-memory
 * mutations" into something a teacher can review, save as one
 * intentional write, or throw away entirely.
 *
 * In-memory only, per classroom, exactly like classModeService's own
 * undo stack (which this sits alongside, not on top of) — never
 * written to Firestore itself. A session's only two possible endings
 * are: commitSession() (the one and only permanent write) or
 * discardSession() (nothing written, in-memory draft state thrown
 * away by re-fetching the classroom from Firestore).
 */

import * as workspaceService from './workspaceService.js';
import * as classModeService from './classModeService.js';

const sessionByClassroomId = new Map();

function getOrCreateSession(classroomId) {
  if (!sessionByClassroomId.has(classroomId)) {
    sessionByClassroomId.set(classroomId, {
      startedAt: new Date().toISOString(),
      actions: [], // { type: 'star' | 'behaviour' | 'badge' | 'bucket' | 'notebook' }
    });
  }
  return sessionByClassroomId.get(classroomId);
}

export function isSessionActive(classroom) {
  return sessionByClassroomId.has(classroom.id);
}

export function startSession(classroom) {
  sessionByClassroomId.set(classroom.id, { startedAt: new Date().toISOString(), actions: [] });
}

/**
 * Called alongside every classModeService action (award, deduct,
 * badge, bucket) and every notebook status change — records that a
 * draft change happened, for the Session Review count. Does NOT
 * duplicate what classModeService's undo stack already tracks; this
 * is a separate, simpler log purely for "how many of each kind of
 * thing happened this session," not for reversing anything.
 */
export function recordAction(classroom, type) {
  const session = getOrCreateSession(classroom.id);
  session.actions.push({ type, at: new Date().toISOString() });
}

/** Powers the Session Review screen's counts. */
export function getSessionSummary(classroom) {
  const session = sessionByClassroomId.get(classroom.id);
  const actions = session?.actions || [];
  return {
    starsAwarded: actions.filter((a) => a.type === 'star').length,
    behaviourNotes: actions.filter((a) => a.type === 'behaviour').length,
    notebookUpdates: actions.filter((a) => a.type === 'notebook').length,
    recognitions: actions.filter((a) => a.type === 'badge').length,
    totalActions: actions.length,
  };
}

/**
 * The single permanent write for the whole session — this is the only
 * place classroom-mode-originated changes reach Firestore now. Every
 * per-action save() call that used to happen on every tap has been
 * removed from classModeService's callers; this replaces all of them
 * with exactly one write, at the moment the teacher explicitly chooses
 * to save.
 */
export function commitSession(classroom) {
  workspaceService.save(classroom);
  classModeService.clearUndoStack(classroom);
  sessionByClassroomId.delete(classroom.id);
}

/**
 * Nothing was ever written, so there's nothing to undo on the server —
 * only the in-memory draft mutations need to be thrown away. Since
 * Firestore was never touched, the classroom document there is still
 * exactly what it was before the session started; re-fetching it and
 * replacing the in-memory copy discards every draft change at once,
 * without needing to track and reverse each one individually.
 */
export async function discardSession(classroom) {
  await workspaceService.reloadClassroomFromServer(classroom.id);
  classModeService.clearUndoStack(classroom);
  sessionByClassroomId.delete(classroom.id);
}
