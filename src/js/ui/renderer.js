/**
 * ui/renderer.js
 *
 * Owns all DOM rendering for the team-cards view. Reads state handed to
 * it by sessionService (via main.js) and renders it into the DOM; forwards
 * student clicks to whatever handler main.js supplied. Contains no
 * business logic of its own.
 */

import { createTeamCardElement } from './components/TeamCard.js';

let container = null;
let handlers = {};

export function mount(rootElement, eventHandlers = {}) {
  container = rootElement;
  handlers = eventHandlers;
}

export function render(state) {
  if (!container) return;

  container.innerHTML = '';

  state.teams.forEach((team) => {
    const studentsForTeam = state.students.filter((student) => student.teamId === team.id);
    const card = createTeamCardElement(team, studentsForTeam, {
      onStudentClick: handlers.onStudentClick,
    });
    container.appendChild(card);
  });
}

export function setUndoEnabled(undoButton, enabled) {
  if (!undoButton) return;
  undoButton.disabled = !enabled;
}
