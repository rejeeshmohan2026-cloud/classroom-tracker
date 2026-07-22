/**
 * models/NotebookType.js
 *
 * A notebook type within a subject (e.g. "Classwork", "Handwriting") —
 * see services/notebookConfigService.js. Stored as an array on
 * classroom.notebookConfig.notebookTypes, referencing its subject by id
 * rather than nesting inside it, so renaming a subject never requires
 * walking into every notebook type.
 */

import { generateId } from '../utils/idGenerator.js';

export function createNotebookType({ id, subjectId, name } = {}) {
  return {
    id: id || generateId(),
    subjectId,
    name,
  };
}
