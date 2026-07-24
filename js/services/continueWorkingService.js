/**
 * services/continueWorkingService.js
 *
 * "Continue Working" (Phase 2's Dashboard widget) — a teacher's own
 * short list of recently-opened notebooks. Deliberately personal, not
 * classroom-shared: two teachers on the same classroom each see their
 * own recent list, not each other's (see
 * repositories/classroomRepository.js's recordRecentNotebook doc
 * comment for why).
 *
 * PHASE 1 SCOPE NOTE: this file is infrastructure only. Nothing in the
 * app calls recordRecentNotebook() yet — wiring it into
 * ui/views/NotebookRegisterView.js (so opening a notebook actually
 * populates this list) is deferred to Phase 2, when the Dashboard
 * widget that consumes this data is built. That keeps this phase's
 * promise that "the application should continue functioning exactly as
 * it does today": no new Firestore writes happen from using the app
 * today, even though the write path below is fully built and tested.
 */

import { firestoreClassroomRepository as repository } from '../repositories/firestoreClassroomRepository.js';

/** Fire-and-forget, like every other save in this app — a failure here should never block the teacher from continuing to use Notebook Tracker. */
export function recordRecentNotebook(uid, { classroomId, subjectId, notebookTypeId }) {
  if (!uid) return;

  repository
    .recordRecentNotebook(uid, {
      classroomId,
      subjectId,
      notebookTypeId,
      openedAt: new Date().toISOString(),
    })
    .catch((error) => {
      console.error('[continueWorkingService] Failed to record recently opened notebook:', error);
    });
}

/** Live subscription to this uid's recent list (most-recent-first, capped at 5). Returns an unsubscribe function. */
export function subscribeToRecent(uid, onChange, onError) {
  return repository.subscribeToRecentNotebooks(uid, onChange, onError);
}

/**
 * One-time read, for the Dashboard's Continue Working widget — see the
 * repository interface's doc comment on getRecentNotebooksOnce() for
 * why this widget doesn't stay live-subscribed.
 */
export async function getRecentOnce(uid) {
  if (!uid) return [];
  try {
    return await repository.getRecentNotebooksOnce(uid);
  } catch (error) {
    console.error('[continueWorkingService] Failed to load recently opened notebooks:', error);
    return [];
  }
}
