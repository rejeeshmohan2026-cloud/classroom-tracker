/**
 * storage/localStorageAdapter.js
 *
 * A concrete storageAdapter.js implementation backed by the browser's
 * localStorage API.
 *
 * As of Sprint 5, classroom data lives in Firestore (see
 * repositories/firestoreClassroomRepository.js) — this adapter is now
 * only used by services/workspaceService.js to (a) read any classrooms
 * saved locally by an earlier version of this app, for one-time
 * migration, and (b) store the small per-account "migration complete"
 * flag. Nothing new is ever written here.
 */

import { StorageAdapter } from './storageAdapter.js';

class LocalStorageAdapter extends StorageAdapter {
  get(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error(`[localStorageAdapter] Failed to read "${key}":`, error);
      return null;
    }
  }

  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[localStorageAdapter] Failed to write "${key}":`, error);
      return false;
    }
  }

  remove(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[localStorageAdapter] Failed to remove "${key}":`, error);
      return false;
    }
  }

  clear() {
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('[localStorageAdapter] Failed to clear storage:', error);
      return false;
    }
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
