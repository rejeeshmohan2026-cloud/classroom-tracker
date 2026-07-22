/**
 * ui/components/SubjectsWidget.js
 *
 * Classroom Dashboard widget: a compact list of configured Subjects.
 * Reuses Notebook Tracker rather than duplicating any notebook
 * management — clicking a subject navigates to the existing, unfiltered
 * Notebook Tracker list (see main.js), which already groups its rows by
 * subject. True per-subject filtering would mean modifying
 * NotebookTrackerView.js, which this phase's "existing modules remain
 * their existing implementation" constraint argues against — flagged
 * as an open question rather than decided silently (see Phase 2's
 * CHANGELOG entry).
 */

import * as notebookConfigService from '../../services/notebookConfigService.js';
import { createEmptyStateElement } from './EmptyState.js';

export function createSubjectsWidgetElement({ classroom, onOpenNotebookTracker }) {
  const widget = document.createElement('div');
  widget.className = 'dashboard-widget';

  const heading = document.createElement('h2');
  heading.className = 'dashboard-widget__heading';
  heading.textContent = '\ud83d\udcda Subjects';
  widget.appendChild(heading);

  const subjects = notebookConfigService.listSubjects(classroom);

  if (subjects.length === 0) {
    widget.appendChild(createEmptyStateElement({ message: 'No subjects configured.' }));
    return widget;
  }

  const list = document.createElement('div');
  list.className = 'dashboard-widget__chip-list';

  subjects.forEach((subject) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'dashboard-widget__chip';
    chip.textContent = subject.name;
    chip.addEventListener('click', onOpenNotebookTracker);
    list.appendChild(chip);
  });

  widget.appendChild(list);
  return widget;
}
