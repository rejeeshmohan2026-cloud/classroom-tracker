/**
 * ui/views/TrackerView.js
 *
 * The per-classroom tracker screen: header (Back / classroom name / Undo
 * / Reset Session / Settings) and the team-cards grid below it. Undo and
 * Reset Session are visible but disabled this milestone — awarding points
 * is a future milestone, so there's nothing to undo or reset yet. The
 * architecture (services/eventService.js) is ready; only the wiring is
 * deferred.
 */

import { createTeamCardElement } from '../components/TeamCard.js';
import { createEmptyStateElement } from '../components/EmptyState.js';
import { getTeamScore } from '../../services/teamService.js';

export function renderTrackerView(container, { classroom, onBack, onSettings }) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'tracker-view';

  const header = document.createElement('header');
  header.className = 'tracker-header';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'btn btn--text';
  backButton.textContent = '← Back';
  backButton.addEventListener('click', onBack);

  const title = document.createElement('h1');
  title.className = 'tracker-header__title';
  title.textContent = classroom.name;

  const actions = document.createElement('div');
  actions.className = 'tracker-header__actions';

  const undoButton = document.createElement('button');
  undoButton.type = 'button';
  undoButton.className = 'btn btn--ghost';
  undoButton.textContent = 'Undo';
  undoButton.disabled = true;
  undoButton.title = 'Scoring is not implemented yet';

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'btn btn--danger';
  resetButton.textContent = 'Reset Session';
  resetButton.disabled = true;
  resetButton.title = 'Scoring is not implemented yet';

  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.className = 'btn btn--ghost';
  settingsButton.textContent = 'Settings';
  settingsButton.addEventListener('click', onSettings);

  actions.append(undoButton, resetButton, settingsButton);
  header.append(backButton, title, actions);

  const grid = document.createElement('section');
  grid.className = 'team-grid';
  grid.setAttribute('aria-label', 'Teams');

  if (classroom.teams.length === 0) {
    grid.appendChild(
      createEmptyStateElement({
        message: 'No groups in this classroom yet. Add some from Settings \u2192 Groups.',
      })
    );
  } else {
    classroom.teams.forEach((team) => {
      grid.appendChild(createTeamCardElement(team, getTeamScore(team)));
    });
  }

  wrapper.append(header, grid);
  container.appendChild(wrapper);
}
