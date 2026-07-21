/**
 * ui/views/WelcomeView.js
 *
 * The first-launch screen, shown whenever the Workspace has zero
 * classrooms — no dummy teams, students, Undo, Reset Session, or
 * scoreboards, per the brief. Just a title, subtitle, and a single call
 * to action.
 */

export function renderWelcomeView(container, { onNewClassroom }) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'welcome-view';

  const title = document.createElement('h1');
  title.className = 'welcome-view__title';
  title.textContent = 'Welcome to Classroom Tracker';

  const subtitle = document.createElement('p');
  subtitle.className = 'welcome-view__subtitle';
  subtitle.textContent =
    'Create your first classroom to begin tracking participation and teamwork.';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--primary btn--large';
  button.textContent = '+ New Classroom';
  button.addEventListener('click', onNewClassroom);

  wrapper.append(title, subtitle, button);
  container.appendChild(wrapper);
}
