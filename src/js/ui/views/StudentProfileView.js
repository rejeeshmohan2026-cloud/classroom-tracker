/**
 * ui/views/StudentProfileView.js
 *
 * The individual Student Profile: name, group, Learning Bucket (editable),
 * current session score, total positive/negative points, Behaviour
 * Badges (award/revoke, plus growing the classroom's badge catalog),
 * Teacher Notes, a "Log Participation" control, and the Participation
 * History timeline. Everything here is computed live from the same
 * underlying data (score, history, badges, notes) — there's no separate
 * "report" data structure to keep in sync, so this page doubles as its
 * own report per the brief.
 *
 * Like ui/views/SettingsView.js and ui/views/SetupWizardView.js, this
 * file calls straight into services and mutates the classroom/student
 * objects directly, persisting via workspaceService.save() after each
 * change.
 */

import * as workspaceService from '../../services/workspaceService.js';
import * as studentService from '../../services/studentService.js';
import * as bucketService from '../../services/bucketService.js';
import * as badgeService from '../../services/badgeService.js';
import * as participationService from '../../services/participationService.js';
import { BUCKET_KEYS, BUCKET_LABELS } from '../../config/bucketConfig.js';
import { formatDate } from '../../utils/dateHelpers.js';
import { createEmptyStateElement } from '../components/EmptyState.js';

export function renderStudentProfileView(container, { classroom, studentId, onBack }) {
  container.innerHTML = '';

  const found = studentService.findStudentInClassroom(classroom, studentId);
  if (!found) {
    container.appendChild(createEmptyStateElement({ message: 'This student could not be found.' }));
    return;
  }

  const { student, team } = found;
  const rerender = () => renderStudentProfileView(container, { classroom, studentId, onBack });

  const wrapper = document.createElement('div');
  wrapper.className = 'profile-view';

  wrapper.appendChild(renderProfileHeader(student, team, onBack));
  wrapper.appendChild(renderOverviewSection(student, rerender));
  wrapper.appendChild(renderBadgesSection(classroom, student, rerender));
  wrapper.appendChild(renderNotesSection(student, rerender));
  wrapper.appendChild(renderLogParticipationSection(student, rerender));
  wrapper.appendChild(renderHistorySection(student));

  container.appendChild(wrapper);
}

function renderProfileHeader(student, team, onBack) {
  const header = document.createElement('header');
  header.className = 'profile-header';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'btn btn--text';
  backButton.textContent = '\u2190 Back to Tracker';
  backButton.addEventListener('click', onBack);

  const titleBlock = document.createElement('div');
  titleBlock.className = 'profile-header__title-block';

  const name = document.createElement('h1');
  name.className = 'profile-header__name';
  name.textContent = student.name;

  const groupLine = document.createElement('p');
  groupLine.className = 'profile-header__group';
  groupLine.textContent = team ? team.name : 'Ungrouped';

  titleBlock.append(name, groupLine);
  header.append(backButton, titleBlock);
  return header;
}

function renderOverviewSection(student, rerender) {
  const section = document.createElement('div');
  section.className = 'profile-overview';

  const bucketCard = document.createElement('div');
  bucketCard.className = 'profile-stat-card';

  const bucketLabel = document.createElement('span');
  bucketLabel.className = 'profile-stat-card__label';
  bucketLabel.textContent = 'Learning Bucket';

  const bucketSelect = document.createElement('select');
  bucketSelect.className = 'profile-stat-card__select';

  const noneOption = document.createElement('option');
  noneOption.value = '';
  noneOption.textContent = 'Not Assigned';
  if (!student.bucket) noneOption.selected = true;
  bucketSelect.appendChild(noneOption);

  BUCKET_KEYS.forEach((key) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = BUCKET_LABELS[key];
    if (student.bucket === key) option.selected = true;
    bucketSelect.appendChild(option);
  });

  bucketSelect.addEventListener('change', () => {
    bucketService.assignBucket(student, bucketSelect.value || null);
    workspaceService.save();
    rerender();
  });

  bucketCard.append(bucketLabel, bucketSelect);

  section.append(
    bucketCard,
    createStatCard('Current Session Score', student.score),
    createStatCard('Total Positive Points', participationService.getTotalPositivePoints(student)),
    createStatCard('Total Negative Points', participationService.getTotalNegativePoints(student))
  );

  return section;
}

function createStatCard(label, value) {
  const card = document.createElement('div');
  card.className = 'profile-stat-card';

  const labelEl = document.createElement('span');
  labelEl.className = 'profile-stat-card__label';
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.className = 'profile-stat-card__value';
  valueEl.textContent = String(value);

  card.append(labelEl, valueEl);
  return card;
}

function renderBadgesSection(classroom, student, rerender) {
  const section = document.createElement('div');
  section.className = 'profile-section';

  const heading = document.createElement('h2');
  heading.className = 'profile-section__heading';
  heading.textContent = 'Behaviour Badges';
  section.appendChild(heading);

  const badgeList = document.createElement('div');
  badgeList.className = 'badge-list';

  const awardedBadges = student.badges || [];
  if (awardedBadges.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'profile-section__meta';
    empty.textContent = 'No badges awarded yet.';
    badgeList.appendChild(empty);
  } else {
    awardedBadges.forEach((badgeName) => {
      const chip = document.createElement('span');
      chip.className = 'badge-chip';

      const label = document.createElement('span');
      label.textContent = badgeName;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'badge-chip__remove';
      removeButton.textContent = '\u00d7';
      removeButton.setAttribute('aria-label', `Remove ${badgeName} badge`);
      removeButton.addEventListener('click', () => {
        badgeService.revokeBadge(student, badgeName);
        workspaceService.save();
        rerender();
      });

      chip.append(label, removeButton);
      badgeList.appendChild(chip);
    });
  }
  section.appendChild(badgeList);

  const catalog = badgeService.listCatalog(classroom);
  const availableBadges = catalog.filter((badge) => !awardedBadges.includes(badge));

  const awardForm = document.createElement('div');
  awardForm.className = 'settings-add-form';

  const badgeSelect = document.createElement('select');
  availableBadges.forEach((badgeName) => {
    const option = document.createElement('option');
    option.value = badgeName;
    option.textContent = badgeName;
    badgeSelect.appendChild(option);
  });

  const awardButton = document.createElement('button');
  awardButton.type = 'button';
  awardButton.className = 'btn btn--ghost';
  awardButton.textContent = 'Award Badge';
  awardButton.disabled = availableBadges.length === 0;
  awardButton.addEventListener('click', () => {
    if (!badgeSelect.value) return;
    badgeService.awardBadge(student, badgeSelect.value);
    workspaceService.save();
    rerender();
  });

  awardForm.append(badgeSelect, awardButton);
  section.appendChild(awardForm);

  const newBadgeForm = document.createElement('div');
  newBadgeForm.className = 'settings-add-form';

  const newBadgeInput = document.createElement('input');
  newBadgeInput.type = 'text';
  newBadgeInput.placeholder = 'New badge name';

  const addBadgeButton = document.createElement('button');
  addBadgeButton.type = 'button';
  addBadgeButton.className = 'btn btn--text';
  addBadgeButton.textContent = 'Add to badge catalog';
  addBadgeButton.addEventListener('click', () => {
    const name = newBadgeInput.value.trim();
    if (!name) return;
    const added = badgeService.addBadgeToCatalog(classroom, name);
    if (!added) {
      window.alert('That badge already exists in this classroom\u2019s catalog.');
      return;
    }
    workspaceService.save();
    rerender();
  });

  newBadgeForm.append(newBadgeInput, addBadgeButton);
  section.appendChild(newBadgeForm);

  return section;
}

function renderNotesSection(student, rerender) {
  const section = document.createElement('div');
  section.className = 'profile-section';

  const heading = document.createElement('h2');
  heading.className = 'profile-section__heading';
  heading.textContent = 'Teacher Notes';
  section.appendChild(heading);

  const textarea = document.createElement('textarea');
  textarea.className = 'profile-notes__textarea';
  textarea.rows = 4;
  textarea.value = student.notes || '';
  section.appendChild(textarea);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'btn btn--primary';
  saveButton.textContent = 'Save Notes';
  saveButton.addEventListener('click', () => {
    studentService.updateNotes(student, textarea.value);
    workspaceService.save();
    rerender();
  });
  section.appendChild(saveButton);

  return section;
}

function renderLogParticipationSection(student, rerender) {
  const section = document.createElement('div');
  section.className = 'profile-section';

  const heading = document.createElement('h2');
  heading.className = 'profile-section__heading';
  heading.textContent = 'Log Participation';
  section.appendChild(heading);

  const intro = document.createElement('p');
  intro.className = 'profile-section__meta';
  intro.textContent = 'Record a point change with a reason \u2014 it\u2019ll appear below in Participation History.';
  section.appendChild(intro);

  const form = document.createElement('div');
  form.className = 'profile-log-form';

  const pointsInput = document.createElement('input');
  pointsInput.type = 'number';
  pointsInput.value = '1';
  pointsInput.className = 'profile-log-form__points';
  pointsInput.setAttribute('aria-label', 'Point value');

  const reasonInput = document.createElement('input');
  reasonInput.type = 'text';
  reasonInput.placeholder = 'Reason, e.g. "Correct answer"';
  reasonInput.className = 'profile-log-form__reason';

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'btn btn--primary';
  addButton.textContent = 'Log Entry';
  addButton.addEventListener('click', () => {
    const delta = Number(pointsInput.value);
    const reason = reasonInput.value.trim();

    if (!Number.isFinite(delta) || delta === 0) {
      window.alert('Enter a non-zero point value.');
      return;
    }
    if (!reason) {
      window.alert('Enter a reason for this entry.');
      return;
    }

    participationService.logPoints(student, delta, reason);
    workspaceService.save();
    rerender();
  });

  form.append(pointsInput, reasonInput, addButton);
  section.appendChild(form);

  return section;
}

function renderHistorySection(student) {
  const section = document.createElement('div');
  section.className = 'profile-section';

  const heading = document.createElement('h2');
  heading.className = 'profile-section__heading';
  heading.textContent = 'Participation History';
  section.appendChild(heading);

  const entries = participationService.listHistory(student);
  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'profile-section__meta';
    empty.textContent = 'No participation logged yet.';
    section.appendChild(empty);
    return section;
  }

  const timeline = document.createElement('ul');
  timeline.className = 'timeline';

  entries.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'timeline__item';

    const label = document.createElement('span');
    label.className = 'timeline__label';

    if (entry.kind === 'badge') {
      label.textContent = `Badge Awarded: ${entry.label}`;
    } else {
      const sign = entry.delta > 0 ? '+' : '';
      label.textContent = `${sign}${entry.delta} ${entry.label}`;
      label.classList.add(entry.delta > 0 ? 'timeline__label--positive' : 'timeline__label--negative');
    }

    const date = document.createElement('span');
    date.className = 'timeline__date';
    date.textContent = formatDate(entry.recordedAt);

    item.append(label, date);
    timeline.appendChild(item);
  });

  section.appendChild(timeline);
  return section;
}
