/**
 * ui/components/TeamCard.js
 *
 * Renders one team card: a header with the team name and total score,
 * and a list of students and their scores. Every student row is a
 * button — clicking it opens that student's profile (see
 * ui/views/StudentProfileView.js) via the onStudentClick handler the
 * caller supplies. This is navigation, not the click-to-award-a-point
 * scoring system referenced elsewhere in the project's history, which
 * remains a future milestone.
 *
 * The header is tinted with the team's assigned colour (see
 * config/groupColorConfig.js), or the default cyan if none was ever
 * assigned. Rendering only, no business logic.
 */

import { getGroupColorHex } from '../../config/groupColorConfig.js';
import { BUCKET_DISPLAY_COLORS } from '../../config/bucketConfig.js';

export function createTeamCardElement(team, teamScore, { onStudentClick } = {}) {
  const card = document.createElement('article');
  card.className = 'team-card';
  card.dataset.teamId = team.id;

  const header = document.createElement('header');
  header.className = 'team-card__header';
  header.style.backgroundColor = team.color ? getGroupColorHex(team.color) : '';

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
  button.setAttribute('aria-label', `Open ${student.name}'s profile`);
  button.addEventListener('click', () => onClick?.(student.id));

  const nameWrapper = document.createElement('span');
  nameWrapper.className = 'student-row__name-wrapper';

  if (student.bucket) {
    const bucketDot = document.createElement('span');
    bucketDot.className = 'student-row__bucket-dot';
    bucketDot.style.backgroundColor = BUCKET_DISPLAY_COLORS[student.bucket];
    bucketDot.setAttribute('aria-label', `${student.bucket} bucket`);
    nameWrapper.appendChild(bucketDot);
  }

  const name = document.createElement('span');
  name.className = 'student-row__name';
  name.textContent = student.name;
  nameWrapper.appendChild(name);

  const score = document.createElement('span');
  score.className = 'student-row__points';
  score.textContent = String(student.score);

  button.append(nameWrapper, score);
  item.appendChild(button);
  return item;
}
