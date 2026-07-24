/**
 * ui/student-portal/onboarding/StudentPickerView.js
 *
 * "Who's learning today?" — shown when a Google account is linked to
 * more than one student (e.g. a parent with two children on Bloom
 * Labs). Also reachable later from the Portal's own Profile screen,
 * for switching between already-linked students without going through
 * sign-in again. Uses the same shared avatar generator as the rest of
 * the Student Portal (see utils/avatarGenerator.js) rather than a
 * fixed icon set, so a sibling's picker entry looks like their own
 * Profile avatar, not a generic placeholder.
 */

import { selectStudent } from '../../../services/studentIdentityService.js';
import { getAvatarForPerson } from '../../../utils/avatarGenerator.js';

export function renderStudentPickerView(container, { students, onSelected }) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'student-picker';

  const title = document.createElement('h1');
  title.className = 'student-picker__title';
  title.textContent = "Who's learning today?";
  wrapper.appendChild(title);

  const list = document.createElement('div');
  list.className = 'student-picker__list';

  students.forEach((studentRef) => {
    const avatar = getAvatarForPerson({ name: studentRef.studentName });

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'student-picker__card';
    card.addEventListener('click', async () => {
      await selectStudent(studentRef);
      onSelected(studentRef);
    });

    const avatarEl = document.createElement('span');
    avatarEl.className = 'student-picker__avatar';
    avatarEl.style.backgroundColor = avatar.color;
    avatarEl.textContent = avatar.initials;

    const nameEl = document.createElement('span');
    nameEl.className = 'student-picker__name';
    nameEl.textContent = studentRef.studentName;

    card.append(avatarEl, nameEl);
    list.appendChild(card);
  });

  wrapper.appendChild(list);
  container.appendChild(wrapper);
}
