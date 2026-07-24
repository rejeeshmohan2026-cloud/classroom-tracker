/**
 * ui/components/SessionReview.js
 *
 * Shown when a teacher presses "End Class" — the one moment in the new
 * Class Session model where the teacher decides what happens to
 * everything that occurred this session. Counts come from
 * services/classSessionService.js's in-memory session log, not from
 * Firestore (nothing has been written there yet). Three outcomes:
 * Continue Teaching (dismiss, keep the session open, nothing changes),
 * Save Session (the one and only permanent write for the whole
 * session), and Discard Session (nothing is written; every draft
 * change is thrown away by re-fetching the classroom from Firestore).
 */

import * as classSessionService from '../../services/classSessionService.js';
import { getDisplayName } from '../../services/classroomService.js';

export function renderSessionReview(container, { classroom, onContinueTeaching, onSaveSession, onDiscardSession }) {
  container.innerHTML = '';

  const summary = classSessionService.getSessionSummary(classroom);

  const wrapper = document.createElement('div');
  wrapper.className = 'session-review';

  const title = document.createElement('h1');
  title.className = 'session-review__title';
  title.textContent = "Today's Session";
  wrapper.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'session-review__subtitle';
  subtitle.textContent = getDisplayName(classroom);
  wrapper.appendChild(subtitle);

  const stats = document.createElement('div');
  stats.className = 'session-review__stats';
  stats.append(
    createStatRow('Stars Awarded', summary.starsAwarded),
    createStatRow('Behaviour Notes', summary.behaviourNotes),
    createStatRow('Notebook Updates', summary.notebookUpdates),
    createStatRow('Recognitions', summary.recognitions)
  );
  wrapper.appendChild(stats);

  if (summary.totalActions === 0) {
    const emptyNote = document.createElement('p');
    emptyNote.className = 'session-review__empty-note';
    emptyNote.textContent = 'Nothing has happened this session yet.';
    wrapper.appendChild(emptyNote);
  }

  const divider = document.createElement('hr');
  divider.className = 'session-review__divider';
  wrapper.appendChild(divider);

  const actions = document.createElement('div');
  actions.className = 'session-review__actions';

  const continueButton = document.createElement('button');
  continueButton.type = 'button';
  continueButton.className = 'btn btn--ghost';
  continueButton.textContent = 'Continue Teaching';
  continueButton.addEventListener('click', onContinueTeaching);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'btn btn--primary';
  saveButton.textContent = 'Save Session';
  saveButton.addEventListener('click', onSaveSession);

  const discardButton = document.createElement('button');
  discardButton.type = 'button';
  discardButton.className = 'btn btn--danger';
  discardButton.textContent = 'Discard Session';
  discardButton.addEventListener('click', () => {
    const confirmed = window.confirm(
      'Discard this entire session? Every star, behaviour note, notebook update, and recognition from this session will be thrown away. Nothing will be saved.'
    );
    if (confirmed) onDiscardSession();
  });

  actions.append(continueButton, saveButton, discardButton);
  wrapper.appendChild(actions);

  container.appendChild(wrapper);
}

function createStatRow(label, value) {
  const row = document.createElement('div');
  row.className = 'session-review__stat-row';

  const labelEl = document.createElement('span');
  labelEl.className = 'session-review__stat-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.className = 'session-review__stat-value';
  valueEl.textContent = String(value);

  row.append(labelEl, valueEl);
  return row;
}
