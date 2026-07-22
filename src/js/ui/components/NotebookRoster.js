/**
 * ui/components/NotebookRoster.js
 *
 * The fast-entry roster used by the Register View: every student, each
 * with two independent inline toggle-button groups (Submission,
 * Completion) — no dialogs, one tap per status. Extracted from the
 * original Notebook Checking screen so the same rendering can be reused
 * anywhere a roster of inline status toggles is needed. Rendering only —
 * the caller supplies onSetSubmission/onSetCompletion and re-renders
 * itself afterwards.
 */

import { SUBMISSION_STATUSES, SUBMISSION_LABELS, COMPLETION_STATUSES, COMPLETION_LABELS } from '../../config/notebookStatuses.js';

export function createNotebookRosterElement({ students, getEntryForStudent, onSetSubmission, onSetCompletion }) {
  const list = document.createElement('div');
  list.className = 'notebook-checking-list';

  students.forEach(({ student, team }) => {
    list.appendChild(
      createRosterRow({
        student,
        team,
        entry: getEntryForStudent(student.id),
        onSetSubmission: (value) => onSetSubmission(student.id, value),
        onSetCompletion: (value) => onSetCompletion(student.id, value),
      })
    );
  });

  return list;
}

function createRosterRow({ student, team, entry, onSetSubmission, onSetCompletion }) {
  const row = document.createElement('div');
  row.className = 'notebook-checking-row';

  const nameEl = document.createElement('span');
  nameEl.className = 'notebook-checking-row__name';
  nameEl.textContent = team ? `${student.name} \u00b7 ${team.name}` : student.name;
  row.appendChild(nameEl);

  row.appendChild(
    createToggleGroup({
      options: SUBMISSION_STATUSES,
      labels: SUBMISSION_LABELS,
      currentValue: entry?.submission || null,
      onSelect: onSetSubmission,
    })
  );

  row.appendChild(
    createToggleGroup({
      options: COMPLETION_STATUSES,
      labels: COMPLETION_LABELS,
      currentValue: entry?.completion || null,
      onSelect: onSetCompletion,
    })
  );

  return row;
}

function createToggleGroup({ options, labels, currentValue, onSelect }) {
  const group = document.createElement('div');
  group.className = 'toggle-group';

  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'toggle-group__button' + (currentValue === option ? ' toggle-group__button--active' : '');
    button.textContent = labels[option];
    button.addEventListener('click', () => onSelect(option));
    group.appendChild(button);
  });

  return group;
}
