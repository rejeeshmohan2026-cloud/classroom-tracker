/**
 * ui/components/TeamCard.js
 *
 * Renders one team card: a header with the team name and total score,
 * and the list of students (see ClassModeStudentRow.js for the actual
 * tap/swipe/long-press interactions). The header is tinted with the
 * team's assigned colour; a student's row uses their Learning Bucket as
 * its visual identity (soft pastel background + coloured left border) —
 * unchanged from earlier sprints.
 *
 * `highlightTeamId` triggers a one-shot "pulse" animation on this card's
 * total when it was the team whose score just changed. Since every
 * action fully re-renders the tracker, this element is always freshly
 * created, so the CSS animation just plays on mount — no cleanup needed.
 */

import { getGroupColorHex } from '../../config/groupColorConfig.js';
import { createClassModeStudentRow } from './ClassModeStudentRow.js';

export function createTeamCardElement(team, teamScore, { onTap, onSwipeLeft, onLongPress, highlightTeamId } = {}) {
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
  if (highlightTeamId && team.id === highlightTeamId) {
    total.classList.add('team-card__total--pulse');
  }
  total.textContent = `${teamScore} \u2b50`;
  total.setAttribute('aria-label', `${team.name} total score: ${teamScore} stars`);

  header.append(title, total);

  const list = document.createElement('ul');
  list.className = 'student-list';
  team.students.forEach((student) => {
    list.appendChild(createClassModeStudentRow(student, { onTap, onSwipeLeft, onLongPress }));
  });

  card.append(header, list);
  return card;
}
