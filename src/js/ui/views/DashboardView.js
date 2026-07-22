/**
 * ui/views/DashboardView.js
 *
 * The Classroom Dashboard — the default landing page for a classroom
 * (replacing Class Mode as the first thing a teacher sees; Class Mode
 * itself is unmodified, just relocated behind "Start Class Mode" — see
 * ui/components/ClassModeWidget.js and main.js's routing).
 *
 * Structured around the four questions the Dashboard should answer, in
 * order:
 *   1. What should I celebrate?     -> Recognition Wall, Weekly Snapshot
 *   2. What needs my attention?     -> Continue Working, Pending Tasks
 *   3. What should I do next?       -> "Teaching" section
 *   4. How is my classroom organized? -> "Classroom" section
 *
 * The first two questions' widgets stay ungrouped at the top, at equal
 * visual weight — grouping only starts where a real category boundary
 * exists (daily workflow vs. structural setup). TeachingSection and
 * ClassroomSection are lightweight layout wrappers, not widgets: they
 * have no data source or service of their own (see those two files).
 *
 * This view is purely an assembly layer: every widget reuses an
 * existing service or view rather than duplicating functionality.
 * Notebook Tracker, Settings (all its tabs), and Class Mode are all
 * reached through here, never reimplemented here.
 *
 * Continue Working is the one section that loads asynchronously — see
 * services/continueWorkingService.js's getRecentOnce() doc comment for
 * why this is a one-time read rather than a live subscription. The rest
 * of the Dashboard renders immediately; that one widget's slot fills in
 * once the read resolves.
 */

import * as notebookConfigService from '../../services/notebookConfigService.js';
import * as continueWorkingService from '../../services/continueWorkingService.js';
import { getDisplayName, getDisplaySubtitle } from '../../services/classroomService.js';
import { createRecognitionWidgetElement } from '../components/RecognitionWidget.js';
import { createWeeklySnapshotWidgetElement } from '../components/WeeklySnapshotWidget.js';
import { createContinueWorkingWidgetElement } from '../components/ContinueWorkingWidget.js';
import { createPendingTasksWidgetElement } from '../components/PendingTasksWidget.js';
import { createSubjectsWidgetElement } from '../components/SubjectsWidget.js';
import { createGroupsWidgetElement } from '../components/GroupsWidget.js';
import { createClassModeWidgetElement } from '../components/ClassModeWidget.js';
import { createTeachingSectionElement } from '../components/TeachingSection.js';
import { createClassroomSectionElement } from '../components/ClassroomSection.js';

export function renderDashboardView(container, props) {
  const { classroom, currentUser, onOpenSettings, onOpenNotebookTracker, onOpenGroups, onStartClassMode, onSelectNotebook } = props;

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'dashboard-view';

  const header = document.createElement('header');
  header.className = 'tracker-header';
  const titleBlock = document.createElement('div');
  const title = document.createElement('h1');
  title.className = 'tracker-header__title';
  title.textContent = getDisplayName(classroom);
  const subtitle = document.createElement('p');
  subtitle.className = 'tracker-header__subtitle';
  subtitle.textContent = getDisplaySubtitle(classroom);
  titleBlock.append(title, subtitle);
  header.appendChild(titleBlock);
  wrapper.appendChild(header);

  const content = document.createElement('div');
  content.className = 'dashboard-view__content';

  // 1. What should I celebrate?
  content.appendChild(createRecognitionWidgetElement({ classroom }));
  content.appendChild(createWeeklySnapshotWidgetElement({ classroom }));

  // 2. What needs my attention?
  const continueWorkingSlot = document.createElement('div');
  content.appendChild(continueWorkingSlot);
  content.appendChild(createPendingTasksWidgetElement({ classroom }));

  // 3. What should I do next? — Start Class Mode listed first within the
  // section for visual priority (it's already the largest, most
  // prominent element via its existing CTA styling — no new visual work
  // needed here, per this phase staying structural rather than a polish
  // pass).
  content.appendChild(
    createTeachingSectionElement({
      children: [
        createClassModeWidgetElement({ onStartClassMode }),
        createSubjectsWidgetElement({ classroom, onOpenNotebookTracker }),
        createActivitiesPlaceholder(),
      ],
    })
  );

  // 4. How is my classroom organized?
  content.appendChild(
    createClassroomSectionElement({
      children: [createGroupsWidgetElement({ classroom, onOpenGroups }), createReportsPlaceholder(), createSettingsButton(onOpenSettings)],
    })
  );

  wrapper.appendChild(content);
  container.appendChild(wrapper);

  loadContinueWorking(classroom, currentUser, continueWorkingSlot, onSelectNotebook);
}

/**
 * Reserved slot for a future, real Activities widget once the Dashboard
 * grows its own entry point to Learning Activities — the feature itself
 * already exists and remains fully reachable via Class Mode's header,
 * unchanged; this placeholder is only about the Dashboard not yet
 * having its own direct link to it. Same "coming soon" treatment as
 * Reports, per this phase's explicit instruction not to build either's
 * functionality yet.
 */
function createActivitiesPlaceholder() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dashboard-widget__chip';
  button.textContent = 'Activities';
  button.disabled = true;
  button.title = 'Coming soon';
  return button;
}

function createReportsPlaceholder() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--ghost';
  button.textContent = 'Reports';
  button.disabled = true;
  button.title = 'Coming soon';
  return button;
}

function createSettingsButton(onOpenSettings) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--ghost';
  button.textContent = 'Settings';
  button.addEventListener('click', onOpenSettings);
  return button;
}

async function loadContinueWorking(classroom, currentUser, slot, onSelectNotebook) {
  const allEntries = await continueWorkingService.getRecentOnce(currentUser?.uid);
  const classroomEntries = allEntries.filter((entry) => entry.classroomId === classroom.id);

  const resolvedEntries = classroomEntries.map((entry) => ({
    ...entry,
    subjectName: notebookConfigService.getSubjectById(classroom, entry.subjectId)?.name || 'Unknown subject',
    notebookTypeName: notebookConfigService.getNotebookTypeById(classroom, entry.notebookTypeId)?.name || 'Unknown notebook',
  }));

  slot.innerHTML = '';
  slot.appendChild(createContinueWorkingWidgetElement({ entries: resolvedEntries, onOpenNotebook: onSelectNotebook }));
}
