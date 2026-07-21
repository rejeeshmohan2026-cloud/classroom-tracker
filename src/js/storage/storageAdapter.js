/**
 * storage/storageAdapter.js
 *
 * Defines the contract every storage backend must implement. Services and
 * sessionService depend on this shape rather than a concrete
 * implementation, so the backend (localStorage today) can be swapped
 * later without changing business logic.
 *
 * Note: this project intentionally does NOT use Firebase or any other
 * external/cloud storage backend.
 */

export class StorageAdapter {
  // eslint-disable-next-line no-unused-vars
  get(key) {
    throw new Error('StorageAdapter.get() must be implemented by a subclass');
  }

  // eslint-disable-next-line no-unused-vars
  set(key, value) {
    throw new Error('StorageAdapter.set() must be implemented by a subclass');
  }

  // eslint-disable-next-line no-unused-vars
  remove(key) {
    throw new Error('StorageAdapter.remove() must be implemented by a subclass');
  }

  clear() {
    throw new Error('StorageAdapter.clear() must be implemented by a subclass');
  }
}
