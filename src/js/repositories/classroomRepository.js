/**
 * repositories/classroomRepository.js
 *
 * Defines the contract every classroom repository must implement —
 * mirrors the storage/storageAdapter.js pattern from earlier sprints,
 * one layer up. services/workspaceService.js depends on this shape,
 * never on Firebase directly, so a future storage provider (or a second
 * one, for tests) can be swapped in by implementing this same contract.
 *
 * `classroomId` in Firestore-backed implementations doubles as the
 * document id, matching the suggested structure:
 *   teachers/{uid}/classrooms/{classroomId}
 */

export class ClassroomRepository {
  /**
   * Subscribes to real-time changes in a teacher's classrooms. Calls
   * onChange(classrooms[]) immediately with the current data and again
   * every time it changes (locally or from another device). Returns an
   * unsubscribe function.
   */
  // eslint-disable-next-line no-unused-vars
  subscribeToClassrooms(uid, onChange, onError) {
    throw new Error('ClassroomRepository.subscribeToClassrooms() must be implemented by a subclass');
  }

  /** One-time read, used only for migration checks — prefer subscribeToClassrooms() otherwise. */
  // eslint-disable-next-line no-unused-vars
  async getAllClassroomsOnce(uid) {
    throw new Error('ClassroomRepository.getAllClassroomsOnce() must be implemented by a subclass');
  }

  /** Upserts a single classroom document — an incremental write, not a whole-workspace rewrite. */
  // eslint-disable-next-line no-unused-vars
  async saveClassroom(uid, classroom) {
    throw new Error('ClassroomRepository.saveClassroom() must be implemented by a subclass');
  }

  // eslint-disable-next-line no-unused-vars
  async deleteClassroom(uid, classroomId) {
    throw new Error('ClassroomRepository.deleteClassroom() must be implemented by a subclass');
  }
}
