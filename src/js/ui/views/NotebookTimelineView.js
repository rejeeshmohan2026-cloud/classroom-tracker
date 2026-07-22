/**
 * ui/views/NotebookTimelineView.js
 *
 * Read-only historical view — deliberately separate from the Register
 * View (today's fast marking workflow). Student-first, matching how a
 * teacher actually asks the question ("How has Hari been doing?" rather
 * than "What happened on July 3?"): one row per student, each a
 * horizontal run of day-symbols for the currently-viewed month, with
 * month navigation. Defaults to the current month.
 */

import * as notebookConfigService from '../../services/notebookConfigService.js';
import * as notebookService from '../../services/notebookService.js';
import { createNotebookTimelineElement } from '../components/NotebookTimeline.js';
import { createEmptyStateElement } from '../components/EmptyState.js';
import { NOTEBOOK_TIMELINE_SYMBOLS, NOTEBOOK_TIMELINE_STATUS_LABELS, deriveDaySymbolKey } from '../../config/notebookStatuses.js';
import { getCurrentYearMonth, shiftYearMonth, formatYearMonth, getDaysInYearMonth } from '../../utils/dateHelpers.js';

export function renderNotebookTimelineView(container, props) {
  const { classroom, subjectId, notebookTypeId, onBack, onNavigateMonth } = props;
  const yearMonth = props.yearMonth || getCurrentYearMonth();

  container.innerHTML = '';

  const subject = notebookConfigService.getSubjectById(classroom, subjectId);
  const notebookType = notebookConfigService.getNotebookTypeById(classroom, notebookTypeId);

  if (!subject || !notebookType) {
    container.appendChild(createEmptyStateElement({ message: 'This notebook could not be found.' }));
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'activities-view';

  const header = document.createElement('header');
  header.className = 'tracker-header';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'btn btn--text';
  backButton.textContent = '\u2190 Back to Register';
  backButton.addEventListener('click', onBack);

  const titleEl = document.createElement('h1');
  titleEl.className = 'tracker-header__title';
  titleEl.textContent = `${subject.name} \u00b7 ${notebookType.name} \u00b7 Timeline`;

  header.append(backButton, titleEl);
  wrapper.appendChild(header);

  const monthBar = document.createElement('div');
  monthBar.className = 'notebook-date-bar';

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'btn btn--text';
  prevButton.textContent = '\u2190';
  prevButton.setAttribute('aria-label', 'Previous month');
  prevButton.addEventListener('click', () => onNavigateMonth(shiftYearMonth(yearMonth, -1)));

  const monthLabel = document.createElement('span');
  monthLabel.className = 'notebook-date-bar__label';
  monthLabel.textContent = formatYearMonth(yearMonth);

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'btn btn--text';
  nextButton.textContent = '\u2192';
  nextButton.setAttribute('aria-label', 'Next month');
  nextButton.addEventListener('click', () => onNavigateMonth(shiftYearMonth(yearMonth, 1)));

  monthBar.append(prevButton, monthLabel, nextButton);
  wrapper.appendChild(monthBar);

  const legend = document.createElement('p');
  legend.className = 'profile-section__meta notebook-timeline-legend';
  legend.style.padding = '0 1.5rem';
  legend.textContent = Object.entries(NOTEBOOK_TIMELINE_SYMBOLS)
    .map(([key, symbol]) => `${symbol} ${NOTEBOOK_TIMELINE_STATUS_LABELS[key]}`)
    .join('   ');
  wrapper.appendChild(legend);

  const allStudents = classroom.teams.flatMap((team) => team.students.map((student) => ({ student, team })));

  const content = document.createElement('div');
  content.className = 'wizard-step-content';

  if (allStudents.length === 0) {
    content.appendChild(createEmptyStateElement({ message: 'There are no students in this classroom yet.' }));
  } else {
    const daysInMonth = getDaysInYearMonth(yearMonth);

    allStudents.forEach(({ student }) => {
      const days = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${yearMonth}-${String(day).padStart(2, '0')}`;
        const entry = notebookService.getEntry(classroom, subjectId, notebookTypeId, dateKey, student.id);
        const symbolKey = deriveDaySymbolKey(entry);
        days.push({
          dateKey,
          symbol: NOTEBOOK_TIMELINE_SYMBOLS[symbolKey],
          statusLabel: NOTEBOOK_TIMELINE_STATUS_LABELS[symbolKey],
        });
      }

      content.appendChild(createNotebookTimelineElement({ label: student.name, days }));
    });
  }

  wrapper.appendChild(content);
  container.appendChild(wrapper);
}
