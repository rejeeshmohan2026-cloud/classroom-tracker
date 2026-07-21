/**
 * storage/localStorageAdapter.js
 *
 * A concrete storageAdapter.js implementation backed by the browser's
 * localStorage API — the default storage backend for this project.
 * Simple, offline-first, no external services or accounts required.
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
