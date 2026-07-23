/**
 * repositories/firestoreClassroomRepository.js
 *
 * The concrete ClassroomRepository implementation backed by Firestore.
 * This is the *only* file in the app that imports the Firestore SDK or
 * knows the document path shapes:
 *   classrooms/{classroomId}                  — one shared document per classroom
 *   users/{uid}/classroomRefs/{classroomId}    — a lightweight pointer, not a copy
 *   users/{uid}                                — per-account flags (migration) and
 *                                                 `recentNotebooks` (Continue Working —
 *                                                 see services/continueWorkingService.js;
 *                                                 personal to the teacher, never the classroom)
 *   teachers/{uid}/classrooms/{classroomId}    — legacy, pre-sharing location (read/delete only, for migration)
 *
 * services/workspaceService.js talks to this only through the
 * ClassroomRepository contract, never to Firestore APIs directly.
 *
 * Offline persistence is enabled via `persistentLocalCache()`, with
 * `persistentMultipleTabManager()` so more than one browser tab of this
 * app can be open at once without fighting over exclusive IndexedDB
 * access (see the comment on `_getDb()` below for what goes wrong
 * without it): reads fall back to the local cache when offline, writes
 * queue locally and sync automatically once the connection returns — no
 * separate offline code is needed anywhere else in the app.
 */

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  runTransaction,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getFirebaseApp } from '../services/firebaseApp.js';
import { ClassroomRepository } from './classroomRepository.js';

class FirestoreClassroomRepository extends ClassroomRepository {
  constructor() {
    super();
    this.db = null;
  }

  _getDb() {
    if (!this.db) {
      const app = getFirebaseApp();
      // persistentMultipleTabManager is required here: without it,
      // persistentLocalCache() defaults to single-tab exclusive access to
      // its IndexedDB store. This app's singleton repository instance is
      // only a singleton *within one tab* — a second tab of the same app
      // open at the same time runs its own independent module instance
      // and would otherwise fight the first tab for that exclusive lock,
      // which is a documented cause of "Firestore INTERNAL ASSERTION
      // FAILED: Unexpected state" and the cascading failures that follow
      // it (including token requests, once Firestore's internal state is
      // corrupted).
      this.db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
    }
    return this.db;
  }

  _classroomDoc(classroomId) {
    return doc(this._getDb(), 'classrooms', classroomId);
  }

  _classroomRefDoc(uid, classroomId) {
    return doc(this._getDb(), 'users', uid, 'classroomRefs', classroomId);
  }

  _classroomRefsCollection(uid) {
    return collection(this._getDb(), 'users', uid, 'classroomRefs');
  }

  _userDoc(uid) {
    return doc(this._getDb(), 'users', uid);
  }

  _legacyClassroomsCollection(uid) {
    return collection(this._getDb(), 'teachers', uid, 'classrooms');
  }

  _legacyClassroomDoc(uid, classroomId) {
    return doc(this._getDb(), 'teachers', uid, 'classrooms', classroomId);
  }

  subscribeToClassroomRefs(uid, onChange, onError) {
    return onSnapshot(
      this._classroomRefsCollection(uid),
      (snapshot) => onChange(snapshot.docs.map((docSnapshot) => ({ classroomId: docSnapshot.id, ...docSnapshot.data() }))),
      (error) => onError?.(error)
    );
  }

  subscribeToClassroom(classroomId, onChange, onError) {
    return onSnapshot(
      this._classroomDoc(classroomId),
      (docSnapshot) => onChange(docSnapshot.exists() ? docSnapshot.data() : null),
      (error) => onError?.(error)
    );
  }

  async createClassroomWithOwner(classroom, ownerUid) {
    const batch = writeBatch(this._getDb());
    batch.set(this._classroomDoc(classroom.id), classroom);
    batch.set(this._classroomRefDoc(ownerUid, classroom.id), {
      role: classroom.members[ownerUid].role,
      joinedAt: classroom.members[ownerUid].joinedAt,
    });
    await batch.commit();
  }

  async saveClassroom(classroom) {
    await setDoc(this._classroomDoc(classroom.id), classroom);
  }

  async deleteClassroom(classroomId, memberUids = []) {
    const batch = writeBatch(this._getDb());
    batch.delete(this._classroomDoc(classroomId));
    memberUids.forEach((uid) => {
      batch.delete(this._classroomRefDoc(uid, classroomId));
    });
    await batch.commit();
  }

  async claimMigration(uid) {
    const db = this._getDb();
    const userDocRef = this._userDoc(uid);
    return runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(userDocRef);
      if (snapshot.exists() && snapshot.data().sharedClassroomsMigrated) {
        return false;
      }
      transaction.set(userDocRef, { sharedClassroomsMigrated: true }, { merge: true });
      return true;
    });
  }

  async getLegacyClassroomsOnce(uid) {
    const snapshot = await getDocs(this._legacyClassroomsCollection(uid));
    return snapshot.docs.map((docSnapshot) => docSnapshot.data());
  }

  async deleteLegacyClassroom(uid, classroomId) {
    await deleteDoc(this._legacyClassroomDoc(uid, classroomId));
  }

  /**
   * Prepends a "recently opened" entry to this uid's own users/{uid}
   * document, capped at 5, most-recent-first. Any existing entry for the
   * same classroom+subject+notebookType is removed first, so reopening a
   * notebook moves it back to the top rather than appearing twice.
   * Wrapped in a transaction — without one, two quick opens in a row (or
   * two tabs) could race on read-modify-write and silently drop one.
   */
  async recordRecentNotebook(uid, entry) {
    const db = this._getDb();
    const userDocRef = this._userDoc(uid);

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(userDocRef);
      const existing = snapshot.exists() ? snapshot.data().recentNotebooks || [] : [];

      const withoutDuplicate = existing.filter(
        (item) =>
          !(
            item.classroomId === entry.classroomId &&
            item.subjectId === entry.subjectId &&
            item.notebookTypeId === entry.notebookTypeId
          )
      );

      const updated = [entry, ...withoutDuplicate].slice(0, 5);
      transaction.set(userDocRef, { recentNotebooks: updated }, { merge: true });
    });
  }

  subscribeToRecentNotebooks(uid, onChange, onError) {
    return onSnapshot(
      this._userDoc(uid),
      (docSnapshot) => onChange(docSnapshot.exists() ? docSnapshot.data().recentNotebooks || [] : []),
      (error) => onError?.(error)
    );
  }

  async getRecentNotebooksOnce(uid) {
    const docSnapshot = await getDoc(this._userDoc(uid));
    return docSnapshot.exists() ? docSnapshot.data().recentNotebooks || [] : [];
  }

  async getThemePreferenceOnce(uid) {
    const docSnapshot = await getDoc(this._userDoc(uid));
    return docSnapshot.exists() ? docSnapshot.data().theme || null : null;
  }

  async setThemePreference(uid, theme) {
    await setDoc(this._userDoc(uid), { theme }, { merge: true });
  }
}

export const firestoreClassroomRepository = new FirestoreClassroomRepository();
