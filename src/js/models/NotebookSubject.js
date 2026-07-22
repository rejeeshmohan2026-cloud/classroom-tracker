/**
 * models/NotebookSubject.js
 *
 * A subject in a classroom's Notebook Tracker configuration (e.g.
 * "English", "Science") — see services/notebookConfigService.js.
 * Stored as an array on classroom.notebookConfig.subjects (order matters
 * for display), so — like Team/Student — this factory self-generates
 * its id.
 */

import { generateId } from '../utils/idGenerator.js';

export function createNotebookSubject({ id, name } = {}) {
  return {
    id: id || generateId(),
    name,
  };
}
