/**
 * ui/components/ClassroomCard.js
 *
 * Renders one classroom summary card for the Home dashboard: display
 * name (Classroom Name if set, otherwise Grade / Section), an optional
 * subtitle for context, and student/teacher counts. Purely props-driven —
 * the display name, subtitle, and counts are all computed by the view
 * (see ui/views/HomeView.js) using classroomService's read-only
 * selectors, not by this component.
 */

export function createClassroomCardElement({ displayName, subtitle, studentCount, memberCount, onClick }) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'classroom-card';
  card.addEventListener('click', () => onClick?.());

  const title = document.createElement('h2');
  title.className = 'classroom-card__name';
  title.textContent = displayName;
  card.appendChild(title);

  if (subtitle) {
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'classroom-card__subtitle';
    subtitleEl.textContent = subtitle;
    card.appendChild(subtitleEl);
  }

  const meta = document.createElement('p');
  meta.className = 'classroom-card__meta';
  meta.textContent = `${studentCount} Student${studentCount === 1 ? '' : 's'} · ${memberCount} Teacher${memberCount === 1 ? '' : 's'}`;
  card.appendChild(meta);

  return card;
}
