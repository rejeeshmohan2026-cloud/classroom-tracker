/**
 * ui/components/TeamCard.js
 *
 * Renders one team card: a header with the team name and running total,
 * and a list of students, each a clickable row that awards that student a
 * point. Rendering only — no business logic; clicks are forwarded to
 * whatever handler the caller supplies.
 *
 * Added in Sprint 1.
 */

export function createTeamCardElement(team, students, { onStudentClick } = {}) {
  const card = document.createElement('article');
  card.className = 'team-card';
  card.dataset.teamId = team.id;

  const header = document.createElement('header');
  header.className = 'team-card__header';

  const title = document.createElement('h2');
  title.className = 'team-card__name';
  title.textContent = team.name;

  const total = document.createElement('span');
  total.className = 'team-card__total';
  total.textContent = String(team.points);
  total.setAttribute('aria-label', `${team.name} total points`);

  header.append(title, total);

  const list = document.createElement('ul');
  list.className = 'student-list';
  students.forEach((student) => {
    list.appendChild(createStudentRowElement(student, { onClick: onStudentClick }));
  });

  card.append(header, list);
  return card;
}

function createStudentRowElement(student, { onClick } = {}) {
  const item = document.createElement('li');
  item.className = 'student-row';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'student-row__button';
  button.dataset.studentId = student.id;
  button.setAttribute('aria-label', `Award a point to ${student.name}`);

  const name = document.createElement('span');
  name.className = 'student-row__name';
  name.textContent = student.name;

  const points = document.createElement('span');
  points.className = 'student-row__points';
  points.textContent = String(student.points);

  button.append(name, points);
  button.addEventListener('click', () => onClick?.(student.id));

  item.appendChild(button);
  return item;
}
