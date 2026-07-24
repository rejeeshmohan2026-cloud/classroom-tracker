/**
 * ui/student-portal/views/StudentLearnView.js
 *
 * A placeholder — Learning Hub (the third Bloom Labs product) doesn't
 * exist yet, so this section has nothing real to show — an honest
 * "not built yet" placeholder rather than inventing fake lesson content.
 */

export function renderStudentLearnView(container) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'student-learn-placeholder';

  const icon = document.createElement('span');
  icon.className = 'student-learn-placeholder__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '\ud83d\udcda';

  const title = document.createElement('h1');
  title.className = 'student-section__title';
  title.textContent = 'Learning Hub';

  const subtitle = document.createElement('p');
  subtitle.className = 'student-learn-placeholder__subtitle';
  subtitle.textContent = 'Coming soon.';

  wrapper.append(icon, title, subtitle);
  container.appendChild(wrapper);
}
