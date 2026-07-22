/**
 * ui/components/PendingTasksWidget.js
 *
 * Classroom Dashboard widget: consumes services/pendingTaskService.js's
 * getPendingTasks() directly. Purely a rendering layer — task detection
 * logic all lives in that service (see docs/PROGRESS_ENGINE.md §9).
 */

import * as pendingTaskService from '../../services/pendingTaskService.js';
import { createEmptyStateElement } from './EmptyState.js';

export function createPendingTasksWidgetElement({ classroom }) {
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
      listItem.textContent = item.count ? `${item.description} (${item.count})` : item.description;
      list.appendChild(listItem);
    });
    widget.appendChild(list);
  });

  return widget;
}
