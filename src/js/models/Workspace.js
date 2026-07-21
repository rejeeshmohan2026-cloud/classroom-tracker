/**
 * models/Workspace.js
 *
 * The root of the data model: a Workspace holds every Classroom the app
 * knows about. Today there is exactly one Workspace, held locally in
 * localStorage, and no concept of "whose" workspace it is (no auth yet).
 * Modelling it explicitly — rather than just storing a bare array of
 * classrooms — gives Firebase a natural place to attach later (a
 * workspace mapped to an authenticated account or organisation) without
 * reshaping anything below it.
 */

export function createWorkspace({ classrooms = [] } = {}) {
  return { classrooms };
}
