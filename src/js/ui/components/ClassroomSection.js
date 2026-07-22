/**
 * ui/components/ClassroomSection.js
 *
 * A lightweight layout wrapper for the Dashboard's "Classroom" grouping —
 * Groups, Reports (future placeholder), Settings. Deliberately NOT a
 * widget, same reasoning as ui/components/TeachingSection.js: no data
 * source of its own, purely a labeled grouping. Answers "how is my
 * classroom organized?" — the fourth, structural question, visually
 * separated from the daily-workflow items above it.
 */

export function createClassroomSectionElement({ children }) {
  const section = document.createElement('section');
  section.className = 'dashboard-section';

  const heading = document.createElement('h2');
  heading.className = 'dashboard-section__heading';
  heading.textContent = 'Classroom';
  section.appendChild(heading);

  const group = document.createElement('div');
  group.className = 'dashboard-section__group';
  children.forEach((child) => group.appendChild(child));
  section.appendChild(group);

  return section;
}
