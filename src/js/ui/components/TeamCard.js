/**
 * ui/components/TeamCard.js
 *
 * Renders one team card: a header with the team name and total score, and
 * a read-only list of students and their scores. No click handling —
 * awarding points is a future milestone (this one is architecture/UI
 * foundation only). Rendering only, no business logic.
 */

export function createTeamCardElement(team, teamScore) {
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
  total.textContent = String(teamScore);
  total.setAttribute('aria-label', `${team.name} total score`);

  header.append(title, total);

  const list = document.createElement('ul');
  list.className = 'student-list';
  team.students.forEach((student) => {
    list.appendChild(createStudentRowElement(student));
  });

  card.append(header, list);
  return card;
}

function createStudentRowElement(student) {
  const item = document.createElement('li');
  item.className = 'student-row';

  const name = document.createElement('span');
  name.className = 'student-row__name';
  name.textContent = student.name;

  const score = document.createElement('span');
  score.className = 'student-row__points';
  score.textContent = String(student.score);

  item.append(name, score);
  return item;
}
