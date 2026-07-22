/**
 * ui/components/TeachingSection.js
 *
 * A lightweight layout wrapper for the Dashboard's "Teaching" grouping —
 * Start Class Mode, Subjects, Activities (future placeholder). Deliberately
 * NOT a widget: it has no data source, no service dependency, and no
 * empty state of its own — it only groups already-built child elements
 * under a heading, answering "what should I do next?" as a labeled
 * section rather than a flat, unlabeled list.
 */

export function createTeachingSectionElement({ children }) {
  const section = document.createElement('section');
  section.className = 'dashboard-section';

  const heading = document.createElement('h2');
  heading.className = 'dashboard-section__heading';
  heading.textContent = 'Teaching';
  section.appendChild(heading);

  const group = document.createElement('div');
  group.className = 'dashboard-section__group';
  children.forEach((child) => group.appendChild(child));
  section.appendChild(group);

  return section;
}
