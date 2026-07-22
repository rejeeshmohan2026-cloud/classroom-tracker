/**
 * ui/views/NotebookCheckingView.js
 *
 * The fast-entry screen for one Notebook Check: every student in one
 * scrollable list, each with two independent inline toggle-button
 * groups (Submission, Completion) and an optional remarks field — no
 * dialogs, no per-student navigation, matching the brief's "one click
 * should update status" requirement exactly.
 *
 * Every click updates the in-memory classroom immediately (instant
 * visual feedback, full re-render — the same pattern used everywhere
 * else in this app) but the actual Firestore write is debounced by
 * ~400ms (see utils/debounce.js), so a quick burst of clicks across a
 * 30-student roster fires one save shortly after the last click, not
 * thirty whole-document writes back to back.
 *
 * Real <button> elements are used for every status control, so Tab/
 * Enter/Space keyboard navigation works for free without any custom
 * shortcut logic — a reasonable baseline given keyboard shortcuts were
 * called out as a bonus, not a requirement.
 */

import * as workspaceService from '../../services/workspaceService.js';
import * as notebookConfigService from '../../services/notebookConfigService.js';
import * as notebookCheckService from '../../services/notebookCheckService.js';
import { SUBMISSION_STATUSES, SUBMISSION_LABELS, COMPLETION_STATUSES, COMPLETION_LABELS, CHECK_STATUS_LABELS } from '../../config/notebookStatuses.js';
import { createEmptyStateElement } from '../components/EmptyState.js';
import { createDebouncedFunction } from '../../utils/debounce.js';

const debouncedSave = createDebouncedFunction((classroom) => workspaceService.save(classroom), 400);

export function renderNotebookCheckingView(container, { classroom, checkId, currentUser, onBack }) {
  container.innerHTML = '';

  const check = notebookCheckService.getCheckById(classroom, checkId);
  if (!check) {
    container.appendChild(createEmptyStateElement({ message: 'This notebook check could not be found.' }));
    return;
  }

  const rerender = () => renderNotebookCheckingView(container, { classroom, checkId, currentUser, onBack });
  const actingUid = currentUser?.uid || null;

  const subject = notebookConfigService.getSubjectById(classroom, check.subjectId);
  const notebookType = notebookConfigService.getNotebookTypeById(classroom, check.notebookTypeId);

  const wrapper = document.createElement('div');
  wrapper.className = 'activities-view';

  const header = document.createElement('header');
  header.className = 'tracker-header';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'btn btn--text';
  backButton.textContent = '\u2190 Back to Notebook Tracker';
  backButton.addEventListener('click', onBack);

  const titleBlock = document.createElement('div');
  titleBlock.className = 'tracker-header__title-block';
  const titleEl = document.createElement('h1');
  titleEl.className = 'tracker-header__title';
  titleEl.textContent = check.title;
  const subtitleEl = document.createElement('p');
  subtitleEl.className = 'tracker-header__subtitle';
  subtitleEl.textContent = `${subject?.name || 'Unknown'} \u00b7 ${notebookType?.name || 'Unknown'} \u00b7 Checked ${check.checkDate.slice(0, 10)}`;
  titleBlock.append(titleEl, subtitleEl);

  const actions = document.createElement('div');
  actions.className = 'tracker-header__actions';

  const statusSelect = document.createElement('select');
  Object.keys(CHECK_STATUS_LABELS).forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = CHECK_STATUS_LABELS[status];
    if (status === check.status) option.selected = true;
    statusSelect.appendChild(option);
  });
  statusSelect.addEventListener('change', () => {
    notebookCheckService.updateCheckStatus(classroom, check.id, statusSelect.value);
    workspaceService.save(classroom);
    rerender();
  });

  actions.appendChild(statusSelect);
  header.append(backButton, titleBlock, actions);
  wrapper.appendChild(header);

  const summary = notebookCheckService.getSubmissionSummary(classroom, check.id);
  const summaryLine = document.createElement('p');
  summaryLine.className = 'profile-section__meta';
  summaryLine.style.padding = '0 1.5rem';
  summaryLine.textContent = `${summary.submitted} / ${summary.total} submitted (${summary.percent}%)`;
  wrapper.appendChild(summaryLine);

  const allStudents = classroom.teams.flatMap((team) => team.students.map((student) => ({ student, team })));

  const content = document.createElement('div');
  content.className = 'wizard-step-content';

  if (allStudents.length === 0) {
    content.appendChild(createEmptyStateElement({ message: 'There are no students in this classroom yet.' }));
  } else {
    const rosterList = document.createElement('div');
    rosterList.className = 'notebook-checking-list';

    allStudents.forEach(({ student, team }) => {
      rosterList.appendChild(createCheckingRow(classroom, check, student, team, actingUid, rerender));
    });

    content.appendChild(rosterList);
  }

  wrapper.appendChild(content);
  container.appendChild(wrapper);
}

function createCheckingRow(classroom, check, student, team, actingUid, rerender) {
  const row = document.createElement('div');
  row.className = 'notebook-checking-row';

  const nameEl = document.createElement('span');
  nameEl.className = 'notebook-checking-row__name';
  nameEl.textContent = `${student.name} \u00b7 ${team.name}`;
  row.appendChild(nameEl);

  const existing = notebookCheckService.getSubmission(classroom, check.id, student.id);

  const submissionGroup = createToggleGroup({
    options: SUBMISSION_STATUSES,
    labels: SUBMISSION_LABELS,
    currentValue: existing?.submission || null,
    onSelect: (value) => {
      notebookCheckService.setSubmission(classroom, check.id, student.id, { submission: value }, actingUid);
      debouncedSave(classroom);
      rerender();
    },
  });
  row.appendChild(submissionGroup);

  const completionGroup = createToggleGroup({
    options: COMPLETION_STATUSES,
    labels: COMPLETION_LABELS,
    currentValue: existing?.completion || null,
    onSelect: (value) => {
      notebookCheckService.setSubmission(classroom, check.id, student.id, { completion: value }, actingUid);
      debouncedSave(classroom);
      rerender();
    },
  });
  row.appendChild(completionGroup);

  const remarksInput = document.createElement('input');
  remarksInput.type = 'text';
  remarksInput.placeholder = 'Remarks';
  remarksInput.className = 'notebook-checking-row__remarks';
  remarksInput.value = existing?.remarks || '';
  remarksInput.addEventListener('change', () => {
    notebookCheckService.setSubmission(classroom, check.id, student.id, { remarks: remarksInput.value.trim() }, actingUid);
    debouncedSave(classroom);
  });
  row.appendChild(remarksInput);

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
