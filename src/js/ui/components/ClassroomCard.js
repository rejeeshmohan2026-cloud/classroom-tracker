/**
 * ui/components/ClassroomCard.js
 *
 * Renders one classroom summary card for the Home dashboard: name,
 * student count, and teacher count. Purely props-driven — counts are
 * computed by the view (see ui/views/HomeView.js) using
 * classroomService's read-only selectors, not by this component.
 */

export function createClassroomCardElement({ name, studentCount, memberCount, onClick }) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'classroom-card';
  card.addEventListener('click', () => onClick?.());

  const title = document.createElement('h2');
  title.className = 'classroom-card__name';
  title.textContent = name;

  const meta = document.createElement('p');
  meta.className = 'classroom-card__meta';
  meta.textContent = `${studentCount} Student${studentCount === 1 ? '' : 's'} · ${memberCount} Teacher${memberCount === 1 ? '' : 's'}`;

  card.append(title, meta);
  return card;
}
