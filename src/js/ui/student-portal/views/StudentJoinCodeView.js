/**
 * ui/student-portal/views/StudentJoinCodeView.js
 *
 * Shown on a first visit to the Student Portal (see
 * services/studentSessionService.js — no stored code yet) and again
 * from Profile's "Join another classroom." Accepts a Classroom ID and
 * stores it locally so future visits skip straight to the dashboard.
 *
 * Deliberately does NOT look the code up against any real classroom —
 * only checks that it's a plausible, non-empty code. See
 * studentSessionService.js's own doc comment for why: a real lookup
 * requires the same AI Working Committee review this project has held
 * actual student data behind throughout. Whatever code is entered here
 * is accepted and the same placeholder dashboard is shown regardless
 * — this screen exists to build and review the *interaction pattern*
 * now, separately from that still-pending decision.
 */

import { setJoinedCode } from '../../../services/studentSessionService.js';

export function renderStudentJoinCodeView(container, { onJoined }) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'student-join-code';

  const icon = document.createElement('span');
  icon.className = 'student-join-code__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '\ud83c\udf93';

  const title = document.createElement('h1');
  title.className = 'student-join-code__title';
  title.textContent = 'Welcome!';

  const subtitle = document.createElement('p');
  subtitle.className = 'student-join-code__subtitle';
  subtitle.textContent = 'Enter your Classroom ID to get started. Your teacher can share this with you.';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'student-join-code__input';
  input.placeholder = 'e.g. A7F2K9';
  input.setAttribute('aria-label', 'Classroom ID');

  const errorMessage = document.createElement('p');
  errorMessage.className = 'student-join-code__error';
  errorMessage.hidden = true;

  const continueButton = document.createElement('button');
  continueButton.type = 'button';
  continueButton.className = 'btn btn--primary btn--large';
  continueButton.textContent = 'Continue';

  continueButton.addEventListener('click', () => {
    const code = input.value.trim();
    if (code.length < 4) {
      errorMessage.textContent = 'Enter the Classroom ID your teacher shared with you.';
      errorMessage.hidden = false;
      input.focus();
      return;
    }
    setJoinedCode(code.toUpperCase());
    onJoined();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') continueButton.click();
  });

  wrapper.append(icon, title, subtitle, input, errorMessage, continueButton);
  container.appendChild(wrapper);

  input.focus();
}
