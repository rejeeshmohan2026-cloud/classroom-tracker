/**
 * storage/storageAdapter.js
 *
 * Defines the contract that any storage backend must implement. Services
 * depend on this interface rather than a concrete implementation, so the
 * underlying storage mechanism (localStorage today, something else later)
 * can be swapped without changing business logic.
 *
 * Not implemented yet. Expected contract (subject to change):
 *   - get(key)
 *   - set(key, value)
 *   - remove(key)
 *   - clear()
 *
 * Note: this project intentionally does NOT use Firebase or any other
 * external/cloud storage backend at this milestone.
 */

// Intentionally left unimplemented for this milestone.
