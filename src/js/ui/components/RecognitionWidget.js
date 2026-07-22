/**
 * ui/components/RecognitionWidget.js
 *
 * The Recognition Wall — the Dashboard's top section. Entirely
 * config-driven: iterates config/recognitionCategories.js and asks
 * services/studentProgressService.js for this week's winner(s) of each.
 * Adding a new category later requires no change to this file — see
 * docs/PROGRESS_ENGINE.md §7.
 *
 * Categories with no winner this week are omitted individually (not
 * shown with a "no winner" placeholder each) — if literally nothing has
 * a winner yet, the whole widget shows one overall empty state instead.
 */

import { RECOGNITION_CATEGORIES } from '../../config/recognitionCategories.js';
import * as studentProgressService from '../../services/studentProgressService.js';
import { createEmptyStateElement } from './EmptyState.js';

export function createRecognitionWidgetElement({ classroom }) {
  const widget = document.createElement('div');
  widget.className = 'dashboard-widget dashboard-widget--recognition';

  const heading = document.createElement('h2');
  heading.className = 'dashboard-widget__heading';
  heading.textContent = '\ud83c\udfc6 Recognition Wall';
  widget.appendChild(heading);

  const categoriesWithWinners = RECOGNITION_CATEGORIES.filter((category) => category.periods.includes('week'))
    .map((category) => ({
      category,
      winners: studentProgressService.getRecognitionWinners(classroom, category.id, 'week'),
    }))
    .filter((entry) => entry.winners.length > 0);

  if (categoriesWithWinners.length === 0) {
    widget.appendChild(createEmptyStateElement({ message: 'No recognitions yet this week.' }));
    return widget;
  }

  const cardRow = document.createElement('div');
  cardRow.className = 'recognition-card-row';

  categoriesWithWinners.forEach(({ category, winners }) => {
    cardRow.appendChild(createRecognitionCard(category, winners));
  });

  widget.appendChild(cardRow);
  return widget;
}

function createRecognitionCard(category, winners) {
  const card = document.createElement('div');
  card.className = 'recognition-card';

  const icon = document.createElement('div');
  icon.className = 'recognition-card__icon';
  icon.textContent = category.icon;

  const label = document.createElement('div');
  label.className = 'recognition-card__label';
  label.textContent = category.label;

  const names = document.createElement('div');
  names.className = 'recognition-card__names';
  names.textContent = winners.map((winner) => winner.studentName || winner.teamName).join(' & ');

  card.append(icon, label, names);
  return card;
}
