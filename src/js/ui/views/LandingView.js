/**
 * ui/views/LandingView.js
 *
 * Bloom Labs' own entry point — shown at the bare root (#/), before any
 * product-specific screen or auth check. Purely a product picker: two
 * journeys, "Continue as Teacher" (into the existing Classroom Tracker
 * app, unchanged) and "Continue as Student" (a placeholder for now —
 * see StudentPlaceholderView.js). No Google sign-in happens here; each
 * product's own auth flow (today, just Classroom Tracker's) still runs
 * exactly as it always has, once a visitor has picked a journey.
 *
 * Deliberately not auth-gated and not classroom-aware — this screen
 * exists one level above both, at the platform layer described in the
 * Bloom Labs product direction (Classroom Tracker / Student Portal /
 * Learning Hub as siblings under one platform, not Classroom Tracker
 * with a login screen bolted in front of it).
 */

export function renderLandingView(container, { onContinueAsTeacher, onContinueAsStudent }) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'landing-view';

  const title = document.createElement('h1');
  title.className = 'landing-view__title';
  title.textContent = 'Bloom Labs';

  const subtitle = document.createElement('p');
  subtitle.className = 'landing-view__subtitle';
  subtitle.textContent = 'One platform, built around two different questions.';

  wrapper.append(title, subtitle);

  const journeys = document.createElement('div');
  journeys.className = 'landing-view__journeys';

  const teacherCard = createJourneyCard({
    icon: '\ud83d\udcca',
    title: 'For Teachers',
    description: '\u201cHow is my classroom doing?\u201d \u2014 manage groups, recognition, notebooks, and progress.',
    buttonLabel: 'Continue as Teacher',
    onSelect: onContinueAsTeacher,
  });

  const studentCard = createJourneyCard({
    icon: '\ud83c\udf93',
    title: 'For Students',
    description: '\u201cHow am I doing?\u201d \u2014 your own progress and achievements, built around your perspective.',
    buttonLabel: 'Continue as Student',
    onSelect: onContinueAsStudent,
  });

  journeys.append(teacherCard, studentCard);
  wrapper.appendChild(journeys);
  container.appendChild(wrapper);
}

function createJourneyCard({ icon, title, description, buttonLabel, onSelect }) {
  const card = document.createElement('div');
  card.className = 'landing-view__journey-card';

  const iconEl = document.createElement('span');
  iconEl.className = 'landing-view__journey-icon';
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.textContent = icon;

  const titleEl = document.createElement('h2');
  titleEl.className = 'landing-view__journey-title';
  titleEl.textContent = title;

  const descriptionEl = document.createElement('p');
  descriptionEl.className = 'landing-view__journey-description';
  descriptionEl.textContent = description;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--primary btn--large';
  button.textContent = buttonLabel;
  button.addEventListener('click', onSelect);

  card.append(iconEl, titleEl, descriptionEl, button);
  return card;
}
