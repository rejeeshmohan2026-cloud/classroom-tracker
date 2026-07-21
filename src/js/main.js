/**
 * main.js
 *
 * Application entry point. Wires sessionService (roster + points + undo +
 * persistence) to the DOM: mounts the renderer, attaches the Undo/Reset
 * button handlers, loads the saved (or default) session, and renders it.
 */

import * as sessionService from './services/sessionService.js';
import * as renderer from './ui/renderer.js';

function renderState(state, undoButton) {
  renderer.render(state);
  renderer.setUndoEnabled(undoButton, sessionService.canUndo());
}

function init() {
  const cardsContainer = document.getElementById('team-cards');
  const undoButton = document.getElementById('undo-btn');
  const resetButton = document.getElementById('reset-btn');

  renderer.mount(cardsContainer, {
    onStudentClick: (studentId) => {
      const state = sessionService.awardPoint(studentId);
      renderState(state, undoButton);
    },
  });

  undoButton.addEventListener('click', () => {
    const state = sessionService.undo();
    renderState(state, undoButton);
  });

  resetButton.addEventListener('click', () => {
    const confirmed = window.confirm(
      'Reset all points for this session? This cannot be undone.'
    );
    if (!confirmed) return;
    const state = sessionService.resetSession();
    renderState(state, undoButton);
  });

  const initialState = sessionService.init();
  renderState(initialState, undoButton);
}

document.addEventListener('DOMContentLoaded', init);
