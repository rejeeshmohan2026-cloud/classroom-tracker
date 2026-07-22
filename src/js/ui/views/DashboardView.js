/**
 * ui/views/DashboardView.js
 *
 * The Classroom Dashboard — the default landing page for a classroom.
 *
 * Phase 4 refinement: the two highest-frequency needs — starting Class
 * Mode, and picking up where a notebook was left off — are now in the
 * header itself (ui/components/ClassroomHeader.js's Primary Action and
 * Secondary Content slots), visible with zero scrolling the instant a
 * teacher opens the classroom. Both are *relocated* from their previous
 * mid-page positions, not duplicated — Start Class Mode no longer
 * appears in the Teaching section, and Continue Working no longer
 * appears as its own section further down the page.
 *
 * Structured around the four questions the Dashboard should answer, in
 * order:
 *   1. What should I celebrate?     -> Recognition Wall, Weekly Snapshot
 *   2. What needs my attention?     -> Pending Tasks (now actionable —
 *      each item deep-links straight to the relevant screen)
 *   3. What should I do next?       -> "Teaching" section (Subjects,
 *      Activities — now a real shortcut into the existing Learning
 *      Activities feature, not a placeholder)
 *   4. How is my classroom organized? -> "Classroom" section
 *
 * TeachingSection and ClassroomSection remain lightweight layout
 * wrappers — no data source or service of their own.
 *
 * This view is purely an assembly layer: every widget reuses an
 * existing service or view rather than duplicating functionality.
 * Notebook Tracker, Settings (all its tabs), Learning Activities, and
 * Class Mode are all reached through here, never reimplemented here.
 *
 * Continue Working is still the one piece that loads asynchronously —
 * see services/continueWorkingService.js's getRecentOnce() doc comment
 * for why this is a one-time read rather than a live subscription. The
 * rest of the Dashboard (including the header's Primary Action) renders
 * immediately; only the header's Secondary Content slot fills in once
 * that read resolves.
 */

import * as notebookConfigService from '../../services/notebookConfigService.js';
import * as continueWorkingService from '../../services/continueWorkingService.js';
import { getDisplayName, getDisplaySubtitle } from '../../services/classroomService.js';
import { createClassroomHeaderElement } from '../components/ClassroomHeader.js';
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
  const {
    classroom,
    currentUser,
    onOpenSettings,
    onOpenNotebookTracker,
    onOpenGroups,
    onStartClassMode,
    onSelectNotebook,
    onOpenRecognition,
    onOpenActivities,
    onSelectPendingTask,
  } = props;

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'dashboard-view';

  const classroomContext = document.createElement('div');
  const title = document.createElement('h1');
  title.className = 'tracker-header__title';
  title.textContent = getDisplayName(classroom);
  const subtitle = document.createElement('p');
  subtitle.className = 'tracker-header__subtitle';
  subtitle.textContent = getDisplaySubtitle(classroom);
  classroomContext.append(title, subtitle);

  const secondaryContentSlot = document.createElement('div');

  wrapper.appendChild(
    createClassroomHeaderElement({
      classroomContext,
      primaryAction: createClassModeWidgetElement({ onStartClassMode }),
      secondaryContent: secondaryContentSlot,
    })
  );

  const content = document.createElement('div');
  content.className = 'dashboard-view__content';

  // 1. What should I celebrate?
  content.appendChild(createRecognitionWidgetElement({ classroom, onViewAll: onOpenRecognition }));
  content.appendChild(createWeeklySnapshotWidgetElement({ classroom }));

  // 2. What needs my attention?
  content.appendChild(createPendingTasksWidgetElement({ classroom, onSelectTask: onSelectPendingTask }));

  // 3. What should I do next?
  content.appendChild(
    createTeachingSectionElement({
      children: [createSubjectsWidgetElement({ classroom, onOpenNotebookTracker }), createActivitiesLink(onOpenActivities)],
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

  loadContinueWorking(classroom, currentUser, secondaryContentSlot, onSelectNotebook);
}

/**
 * Real shortcut into the existing Learning Activities feature (see
 * services/learningActivityService.js, ui/views/ActivitiesView.js) —
 * upgraded this phase from a disabled "Coming soon" placeholder, since
 * the feature itself was never actually unbuilt; the Dashboard just
 * hadn't grown a direct link to it yet.
 */
function createActivitiesLink(onOpenActivities) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dashboard-widget__chip';
  button.textContent = 'Activities';
  button.addEventListener('click', onOpenActivities);
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
