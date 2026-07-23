/**
 * ui/views/StudentPlaceholderView.js
 *
 * "Student Portal coming soon" — deliberately minimal, per explicit
 * direction not to build any student functionality yet. This is a
 * placeholder for the #/student route, not a stub of the real Student
 * Portal; per the product philosophy (the Student Portal is its own
 * experience built around "How am I doing?", not a restricted view of
 * Classroom Tracker), there is nothing here to reuse from the teacher
 * app when that work actually starts.
 */

export function renderStudentPlaceholderView(container, { onBackToLanding }) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'welcome-view';

  const title = document.createElement('h1');
  title.className = 'welcome-view__title';
  title.textContent = 'Student Portal';

  const subtitle = document.createElement('p');
  subtitle.className = 'welcome-view__subtitle';
  subtitle.textContent = 'Coming soon.';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--text';
  button.textContent = '\u2190 Back to Bloom Labs';
  button.addEventListener('click', onBackToLanding);

  wrapper.append(title, subtitle, button);
  container.appendChild(wrapper);
}
