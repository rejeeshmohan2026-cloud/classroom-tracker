/**
 * repositories/firestoreClassroomRepository.js
 *
 * The concrete ClassroomRepository implementation backed by Firestore.
 * This is the *only* file in the app that imports the Firestore SDK or
 * knows the document path shape (teachers/{uid}/classrooms/{classroomId})
 * — services/workspaceService.js talks to this only through the
 * ClassroomRepository contract, never to Firestore APIs directly.
 *
 * Offline persistence is enabled via `persistentLocalCache()`: reads
 * fall back to the local cache when offline, writes queue locally and
 * sync automatically once the connection returns — no separate offline
 * code is needed anywhere else in the app.
 */

import {
  initializeFirestore,
  persistentLocalCache,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
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
      this.db = initializeFirestore(app, { localCache: persistentLocalCache() });
    }
    return this.db;
  }

  _classroomsCollection(uid) {
    return collection(this._getDb(), 'teachers', uid, 'classrooms');
  }

  _classroomDoc(uid, classroomId) {
    return doc(this._getDb(), 'teachers', uid, 'classrooms', classroomId);
  }

  subscribeToClassrooms(uid, onChange, onError) {
    // TEMPORARY DEBUG LOGGING — remove after cross-device investigation.
    console.log('[FIRESTORE]');
    console.log('Listening path:', `teachers/${uid}/classrooms`);

    return onSnapshot(
      this._classroomsCollection(uid),
      (snapshot) => {
        // TEMPORARY DEBUG LOGGING — remove after cross-device investigation.
        console.log('[FIRESTORE]');
        console.log('Snapshot docs:', snapshot.docs.length);
        console.log('IDs:', snapshot.docs.map((d) => d.id));
        onChange(snapshot.docs.map((docSnapshot) => docSnapshot.data()));
      },
      (error) => {
        // TEMPORARY DEBUG LOGGING — remove after cross-device investigation.
        console.error('[FIRESTORE ERROR]', error);
        onError?.(error);
      }
    );
  }

  async getAllClassroomsOnce(uid) {
    const snapshot = await getDocs(this._classroomsCollection(uid));
    return snapshot.docs.map((docSnapshot) => docSnapshot.data());
  }

  async saveClassroom(uid, classroom) {
    await setDoc(this._classroomDoc(uid, classroom.id), classroom);
  }

  async deleteClassroom(uid, classroomId) {
    await deleteDoc(this._classroomDoc(uid, classroomId));
  }
}

export const firestoreClassroomRepository = new FirestoreClassroomRepository();
