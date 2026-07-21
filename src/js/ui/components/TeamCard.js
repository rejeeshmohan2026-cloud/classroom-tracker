/**
 * ui/components/TeamCard.js
 *
 * Renders one team card: a header with the team name and total score,
 * and a list of students and their scores. Every student row is a
 * button — clicking it opens that student's profile (see
 * ui/views/StudentProfileView.js) via the onStudentClick handler the
 * caller supplies.
 *
 * A student's row uses their Learning Bucket as its visual identity: a
 * soft pastel background and a coloured left border (never a bright
 * solid colour) — see config/bucketConfig.js's BUCKET_ROW_STYLES. This
 * is deliberately not a small dot; the bucket should be readable at a
 * glance across the whole row while keeping good contrast for the
 * student's name.
 *
 * The header is tinted with the team's assigned colour (see
 * config/groupColorConfig.js) — group colour and bucket colour are
 * independent of one another.
 */

import { getGroupColorHex } from '../../config/groupColorConfig.js';
import { getBucketRowStyle } from '../../config/bucketConfig.js';

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
  const style = getBucketRowStyle(student.bucket);

  const item = document.createElement('li');
  item.className = 'student-row';
  item.style.backgroundColor = style.background;
  item.style.borderLeftColor = style.border;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'student-row__button';
  button.dataset.studentId = student.id;
  button.setAttribute('aria-label', `Open ${student.name}'s profile`);
  button.addEventListener('click', () => onClick?.(student.id));

  const name = document.createElement('span');
  name.className = 'student-row__name';
  name.textContent = student.name;

  const score = document.createElement('span');
  score.className = 'student-row__points';
  score.textContent = String(student.score);

  button.append(name, score);
  item.appendChild(button);
  return item;
}
