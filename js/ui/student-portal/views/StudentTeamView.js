/**
 * ui/student-portal/views/StudentTeamView.js
 *
 * A student's own group, from their side — teammates and the team's
 * combined stars, reusing the same avatar generator as everywhere
 * else in the Portal. Placeholder data for now — see
 * services/studentPortalDataService.js.
 */

import { getTeamSummary } from '../../../services/studentPortalDataService.js';
import { getAvatarForPerson } from '../../../utils/avatarGenerator.js';

export function renderStudentTeamView(container) {
  container.innerHTML = '';

  const team = getTeamSummary();

  const wrapper = document.createElement('div');
  wrapper.className = 'student-team';

  const title = document.createElement('h1');
  title.className = 'student-section__title';
  title.textContent = team.teamName;
  wrapper.appendChild(title);

  const starsLine = document.createElement('p');
  starsLine.className = 'student-team__stars';
  starsLine.textContent = `${team.teamStars} \u2b50 as a team`;
  wrapper.appendChild(starsLine);

  const list = document.createElement('div');
  list.className = 'student-team__list';
  team.teammates.forEach((name) => {
    const avatar = getAvatarForPerson({ name });

    const row = document.createElement('div');
    row.className = 'student-team__row';

    const avatarEl = document.createElement('span');
    avatarEl.className = 'student-team__row-avatar';
    avatarEl.style.backgroundColor = avatar.color;
    avatarEl.textContent = avatar.initials;

    const nameEl = document.createElement('span');
    nameEl.className = 'student-team__row-name';
    nameEl.textContent = name;

    row.append(avatarEl, nameEl);
    list.appendChild(row);
  });
  wrapper.appendChild(list);

  container.appendChild(wrapper);
}
