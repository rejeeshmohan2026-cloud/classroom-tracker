/**
 * ui/components/GroupsWidget.js
 *
 * Classroom Dashboard widget: a compact list of Groups (Teams) and
 * their student counts. Reuses the existing Settings > Groups tab for
 * actual management — this widget is read-only navigation, not a
 * second place to add/rename/remove groups.
 */

import { createEmptyStateElement } from './EmptyState.js';

export function createGroupsWidgetElement({ classroom, onOpenGroups }) {
  const widget = document.createElement('div');
  widget.className = 'dashboard-widget';

  const heading = document.createElement('h2');
  heading.className = 'dashboard-widget__heading';
  heading.textContent = '\ud83d\udc65 Groups';
  widget.appendChild(heading);

  if (classroom.teams.length === 0) {
    widget.appendChild(createEmptyStateElement({ message: 'No groups yet.' }));
    return widget;
  }

  const list = document.createElement('div');
  list.className = 'dashboard-widget__chip-list';

  classroom.teams.forEach((team) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'dashboard-widget__chip';
    chip.textContent = `${team.name} (${team.students.length})`;
    chip.addEventListener('click', onOpenGroups);
    list.appendChild(chip);
  });

  widget.appendChild(list);
  return widget;
}
