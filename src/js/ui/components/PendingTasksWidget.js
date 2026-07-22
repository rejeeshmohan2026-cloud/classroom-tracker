/**
 * ui/components/PendingTasksWidget.js
 *
 * Classroom Dashboard widget: consumes services/pendingTaskService.js's
 * getPendingTasks() directly. Purely a rendering layer — task detection
 * logic all lives in that service (see docs/PROGRESS_ENGINE.md §9).
 *
 * Phase 4: each item is now clickable via the optional onSelectTask
 * callback, deep-linking straight to the relevant screen (a notebook's
 * Register View, or an Activity's roster) instead of only describing
 * what's outstanding. No change to pendingTaskService itself — every
 * checker already returned everything a link needs (subjectId/
 * notebookTypeId/dateKey, or activityId); this widget just wires clicks
 * to data that was already there.
 */

import * as pendingTaskService from '../../services/pendingTaskService.js';
import { createEmptyStateElement } from './EmptyState.js';

export function createPendingTasksWidgetElement({ classroom, onSelectTask }) {
  const widget = document.createElement('div');
  widget.className = 'dashboard-widget';

  const heading = document.createElement('h2');
  heading.className = 'dashboard-widget__heading';
  heading.textContent = '\u2705 Pending Tasks';
  widget.appendChild(heading);

  const taskGroups = pendingTaskService.getPendingTasks(classroom);

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
      const label = item.count ? `${item.description} (${item.count})` : item.description;

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
