/**
 * services/notebookConfigService.js
 *
 * Manages a classroom's notebook taxonomy — Subjects and Notebook Types
 * (see models/Classroom.js's `notebookConfig`). Deliberately not
 * hardcoded: a teacher adds/renames/removes both from Settings >
 * Notebooks, matching the brief exactly ("the notebook structure must
 * NOT be hardcoded").
 *
 * Notebook Types are linked to a Subject by id (not nested inside it),
 * the same "flat list + id reference" shape already used for
 * learningActivities and settings.badgeCatalog — renaming a subject
 * doesn't require walking into every notebook type that references it.
 */

import { createNotebookSubject } from '../models/NotebookSubject.js';
import { createNotebookType } from '../models/NotebookType.js';

export function listSubjects(classroom) {
  return classroom.notebookConfig.subjects;
}

export function addSubject(classroom, name) {
  const subject = createNotebookSubject({ name });
  classroom.notebookConfig.subjects.push(subject);
  return subject;
}

export function renameSubject(classroom, subjectId, newName) {
  const subject = classroom.notebookConfig.subjects.find((s) => s.id === subjectId);
  if (subject) subject.name = newName;
  return subject;
}

/** Also removes every notebook type that belonged to this subject. */
export function removeSubject(classroom, subjectId) {
  classroom.notebookConfig.subjects = classroom.notebookConfig.subjects.filter((s) => s.id !== subjectId);
  classroom.notebookConfig.notebookTypes = classroom.notebookConfig.notebookTypes.filter(
    (type) => type.subjectId !== subjectId
  );
}

export function listNotebookTypes(classroom, subjectId) {
  const types = classroom.notebookConfig.notebookTypes;
  return subjectId ? types.filter((type) => type.subjectId === subjectId) : types;
}

export function addNotebookType(classroom, subjectId, name) {
  const type = createNotebookType({ subjectId, name });
  classroom.notebookConfig.notebookTypes.push(type);
  return type;
}

export function renameNotebookType(classroom, typeId, newName) {
  const type = classroom.notebookConfig.notebookTypes.find((t) => t.id === typeId);
  if (type) type.name = newName;
  return type;
}

export function removeNotebookType(classroom, typeId) {
  classroom.notebookConfig.notebookTypes = classroom.notebookConfig.notebookTypes.filter((t) => t.id !== typeId);
}

export function getSubjectById(classroom, subjectId) {
  return classroom.notebookConfig.subjects.find((s) => s.id === subjectId) || null;
}

export function getNotebookTypeById(classroom, typeId) {
  return classroom.notebookConfig.notebookTypes.find((t) => t.id === typeId) || null;
}
