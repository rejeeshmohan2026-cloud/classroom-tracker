/**
 * ui/views/NotebookRegisterView.js
 *
 * The primary working screen: Subject and Notebook Type are already
 * chosen (via the Notebook Tracker list), today's date is selected
 * automatically, and the whole roster is one tap away from being
 * marked. A Timeline button/icon in the header is the only way to reach
 * historical viewing from here — Register and Timeline are deliberately
 * separate experiences (today's marking workflow vs. read-only history),
 * not combined on one screen.
 *
 * Reuses ui/components/NotebookRoster.js as-is for the actual roster
 * rendering; this view's own job is just the date it's showing and
 * wiring taps through to services/notebookService.js.
 */

import * as workspaceService from '../../services/workspaceService.js';
import * as notebookConfigService from '../../services/notebookConfigService.js';
import * as notebookService from '../../services/notebookService.js';
import { createNotebookRosterElement } from '../components/NotebookRoster.js';
import { createEmptyStateElement } from '../components/EmptyState.js';
import { getTodayDateKey, shiftDateKey, formatDateKey } from '../../utils/dateHelpers.js';
import { createDebouncedFunction } from '../../utils/debounce.js';

const debouncedSave = createDebouncedFunction((classroom) => workspaceService.save(classroom), 400);

export function renderNotebookRegisterView(container, props) {
  const { classroom, subjectId, notebookTypeId, currentUser, onBack, onNavigateDate, onOpenTimeline } = props;
  const dateKey = props.dateKey || getTodayDateKey();

  container.innerHTML = '';

  const subject = notebookConfigService.getSubjectById(classroom, subjectId);
  const notebookType = notebookConfigService.getNotebookTypeById(classroom, notebookTypeId);

  if (!subject || !notebookType) {
    container.appendChild(createEmptyStateElement({ message: 'This notebook could not be found.' }));
    return;
  }

  const rerender = () => renderNotebookRegisterView(container, { ...props, dateKey });
  const actingUid = currentUser?.uid || null;

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
  titleEl.textContent = `${subject.name} \u00b7 ${notebookType.name}`;
  titleBlock.appendChild(titleEl);

  const actions = document.createElement('div');
  actions.className = 'tracker-header__actions';

  const timelineButton = document.createElement('button');
  timelineButton.type = 'button';
  timelineButton.className = 'btn btn--ghost';
  timelineButton.textContent = '\ud83d\udcc5 Timeline';
  timelineButton.addEventListener('click', onOpenTimeline);
  actions.appendChild(timelineButton);

  header.append(backButton, titleBlock, actions);
  wrapper.appendChild(header);

  const dateBar = document.createElement('div');
  dateBar.className = 'notebook-date-bar';

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'btn btn--text';
  prevButton.textContent = '\u2190';
  prevButton.setAttribute('aria-label', 'Previous day');
  prevButton.addEventListener('click', () => onNavigateDate(shiftDateKey(dateKey, -1)));

  const dateLabel = document.createElement('span');
  dateLabel.className = 'notebook-date-bar__label';
  dateLabel.textContent = formatDateKey(dateKey);
  if (dateKey === getTodayDateKey()) {
    const todayBadge = document.createElement('span');
    todayBadge.className = 'notebook-date-bar__today-badge';
    todayBadge.textContent = 'Today';
    dateLabel.appendChild(todayBadge);
  }

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'btn btn--text';
  nextButton.textContent = '\u2192';
  nextButton.setAttribute('aria-label', 'Next day');
  nextButton.addEventListener('click', () => onNavigateDate(shiftDateKey(dateKey, 1)));

  dateBar.append(prevButton, dateLabel, nextButton);
  wrapper.appendChild(dateBar);

  const summary = notebookService.getRegisterSummary(classroom, subjectId, notebookTypeId, dateKey);
  const summaryLine = document.createElement('p');
  summaryLine.className = 'profile-section__meta';
  summaryLine.style.padding = '0 1.5rem';
  summaryLine.textContent = `\ud83d\udcd2 ${summary.submitted} / ${summary.total} submitted (${summary.percent}%)`;
  wrapper.appendChild(summaryLine);

  const allStudents = classroom.teams.flatMap((team) => team.students.map((student) => ({ student, team })));

  const content = document.createElement('div');
  content.className = 'wizard-step-content';

  if (allStudents.length === 0) {
    content.appendChild(createEmptyStateElement({ message: 'There are no students in this classroom yet.' }));
  } else {
    content.appendChild(
      createNotebookRosterElement({
        students: allStudents,
        getEntryForStudent: (studentId) => notebookService.getEntry(classroom, subjectId, notebookTypeId, dateKey, studentId),
        onSetSubmission: (studentId, value) => {
          notebookService.setEntry(classroom, subjectId, notebookTypeId, dateKey, studentId, { submission: value }, actingUid);
          debouncedSave(classroom);
          rerender();
        },
        onSetCompletion: (studentId, value) => {
          notebookService.setEntry(classroom, subjectId, notebookTypeId, dateKey, studentId, { completion: value }, actingUid);
          debouncedSave(classroom);
          rerender();
        },
      })
    );
  }

  wrapper.appendChild(content);
  container.appendChild(wrapper);
}
