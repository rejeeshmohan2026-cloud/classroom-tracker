/**
 * ui/components/PendingTasksWidget.js
 *
 * Classroom Dashboard widget: consumes services/pendingTaskService.js's
 * getPendingTasks() directly. Purely a rendering layer — task detection
 * logic all lives in that service (see docs/PROGRESS_ENGINE.md §9).
 *
 * Phase 4: each item is clickable via the optional onSelectTask
 * callback, deep-linking straight to the relevant screen.
 *
 * Phase 5 (motion): when an item that was pending a moment ago is no
 * longer returned by getPendingTasks() (a notebook got checked, an
 * activity got marked), it briefly reappears as a success-colored,
 * collapsing line rather than just vanishing — "combine a brief success
 * indication with a height collapse to prevent abrupt layout shifts."
 *
 * This requires remembering what was pending on the *previous* render,
 * which this otherwise-pure rendering module doesn't normally need —
 * a small, deliberate exception, kept as narrow as possible: a
 * module-level map from classroomId to a snapshot of {key -> label},
 * compared each render purely to compute what just disappeared. Nothing
 * here writes to Firestore or calls any service beyond the existing
 * read; it's bookkeeping for one visual effect, not new application
 * state.
 */

import * as pendingTaskService from '../../services/pendingTaskService.js';
import { createEmptyStateElement } from './EmptyState.js';

const previousSnapshotByClassroomId = new Map();

function getItemKey(groupId, item) {
  if (item.activityId) return `${groupId}:activity:${item.activityId}`;
  return `${groupId}:notebook:${item.subjectId}:${item.notebookTypeId}:${item.dateKey || 'today'}`;
}

function getItemLabel(item) {
  return item.count ? `${item.description} (${item.count})` : item.description;
}

export function createPendingTasksWidgetElement({ classroom, onSelectTask }) {
  const widget = document.createElement('div');
  widget.className = 'dashboard-widget';

  const heading = document.createElement('h2');
  heading.className = 'dashboard-widget__heading';
  heading.textContent = '\u2705 Pending Tasks';
  widget.appendChild(heading);

  const taskGroups = pendingTaskService.getPendingTasks(classroom);

  const currentSnapshot = new Map();
  taskGroups.forEach((group) => {
    group.items.forEach((item) => {
      currentSnapshot.set(getItemKey(group.id, item), getItemLabel(item));
    });
  });

  const previousSnapshot = previousSnapshotByClassroomId.get(classroom.id) || new Map();
  const justResolvedLabels = [];
  previousSnapshot.forEach((label, key) => {
    if (!currentSnapshot.has(key)) justResolvedLabels.push(label);
  });
  previousSnapshotByClassroomId.set(classroom.id, currentSnapshot);

  if (justResolvedLabels.length > 0) {
    const resolvedList = document.createElement('ul');
    resolvedList.className = 'dashboard-widget__resolved-list';

    justResolvedLabels.forEach((label) => {
      const item = document.createElement('li');
      item.className = 'dashboard-widget__resolved-item';
      item.textContent = `\u2713 ${label}`;
      resolvedList.appendChild(item);

      // Mounted in its normal (visible) state first, then the collapsing
      // class is added a frame later — the standard technique for
      // animating an element's exit via CSS transitions, which need a
      // real starting state to transition from.
      requestAnimationFrame(() => {
        item.classList.add('dashboard-widget__resolved-item--collapsing');
      });
    });

    widget.appendChild(resolvedList);
  }

  if (taskGroups.length === 0) {
    widget.appendChild(createEmptyStateElement({ message: 'You\u2019re all caught up.' }));
    return widget;
  }

  taskGroups.forEach((group) => {
    const groupHeading = document.createElement('h3');
    groupHeading.className = 'dashboard-widget__subheading';
    groupHeading.textContent = `${group.icon} ${group.label} (${group.items.length})`;
    widget.appendChild(groupHeading);

    const list = document.createElement('ul');
    list.className = 'dashboard-widget__task-list';

    group.items.forEach((item) => {
      const listItem = document.createElement('li');
      const label = getItemLabel(item);

      if (onSelectTask) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dashboard-widget__task-link';
        button.textContent = label;
        button.addEventListener('click', () => onSelectTask(group.id, item));
        listItem.appendChild(button);
      } else {
        listItem.textContent = label;
      }

      list.appendChild(listItem);
    });

    widget.appendChild(list);
  });

  return widget;
}
