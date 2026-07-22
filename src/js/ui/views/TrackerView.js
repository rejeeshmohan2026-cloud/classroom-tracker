/**
 * ui/views/TrackerView.js
 *
 * Class Mode: the tracker is now the primary working screen during a
 * lesson. Tap a student to award a star, swipe left to deduct a point,
 * press and hold for Quick Actions (Award Badge / Add Note / Change
 * Bucket / Open Full Profile) — see ClassModeStudentRow.js and
 * QuickActionsSheet.js. Every action saves immediately, shows a subtle
 * toast, and re-renders in place (no navigation, no modal for the
 * routine actions). Undo reverses the single most recent action of any
 * kind (see services/classModeService.js); Reset Session zeroes every
 * student's score for a fresh lesson without touching their permanent
 * profile data (badges, notes, bucket, lifetime history).
 */

import { createTeamCardElement } from '../components/TeamCard.js';
import { createEmptyStateElement } from '../components/EmptyState.js';
import { openQuickActionsSheet } from '../components/QuickActionsSheet.js';
import { openAwardBadgeModal } from '../components/AwardBadgeModal.js';
import { openAddNoteModal } from '../components/AddNoteModal.js';
import { showToast } from '../components/Toast.js';
import * as workspaceService from '../../services/workspaceService.js';
import * as studentService from '../../services/studentService.js';
import * as badgeService from '../../services/badgeService.js';
import * as noteService from '../../services/noteService.js';
import * as classModeService from '../../services/classModeService.js';
import { getTeamScore } from '../../services/teamService.js';
import { getDisplayName, getDisplaySubtitle } from '../../services/classroomService.js';

export function renderTrackerView(container, props) {
  const { classroom, onBack, onSettings, onActivities, onNotebooks, onSelectStudent } = props;
  const highlight = props._highlight || {};

  container.innerHTML = '';

  const rerender = (nextHighlight) => {
    renderTrackerView(container, { ...props, _highlight: nextHighlight || {} });
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'tracker-view';

  const header = document.createElement('header');
  header.className = 'tracker-header';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'btn btn--text';
  backButton.textContent = '← Back';
  backButton.addEventListener('click', onBack);

  const titleBlock = document.createElement('div');
  titleBlock.className = 'tracker-header__title-block';

  const title = document.createElement('h1');
  title.className = 'tracker-header__title';
  title.textContent = getDisplayName(classroom);
  titleBlock.appendChild(title);

  const subtitle = getDisplaySubtitle(classroom);
  if (subtitle) {
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'tracker-header__subtitle';
    subtitleEl.textContent = subtitle;
    titleBlock.appendChild(subtitleEl);
  }

  const actions = document.createElement('div');
  actions.className = 'tracker-header__actions';

  const hasStudents = classroom.teams.some((team) => team.students.length > 0);

  const undoButton = document.createElement('button');
  undoButton.type = 'button';
  undoButton.className = 'btn btn--ghost';
  undoButton.textContent = 'Undo';
  undoButton.disabled = !classModeService.canUndo(classroom);
  undoButton.addEventListener('click', () => {
    const undone = classModeService.undo(classroom);
    if (undone) {
      workspaceService.save(classroom);
      showToast('Last action undone');
      rerender();
    }
  });

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'btn btn--danger';
  resetButton.textContent = 'Reset Session';
  resetButton.disabled = !hasStudents;
  resetButton.addEventListener('click', () => {
    const confirmed = window.confirm(
      'Reset every student\u2019s score to zero for a new session? Badges, notes, buckets, and history are kept.'
    );
    if (!confirmed) return;
    studentService.resetAllScores(classroom);
    classModeService.clearUndoStack(classroom);
    workspaceService.save(classroom);
    showToast('Session reset');
    rerender();
  });

  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.className = 'btn btn--ghost';
  settingsButton.textContent = 'Settings';
  settingsButton.addEventListener('click', onSettings);

  const activitiesButton = document.createElement('button');
  activitiesButton.type = 'button';
  activitiesButton.className = 'btn btn--ghost';
  activitiesButton.textContent = 'Learning Activities';
  activitiesButton.addEventListener('click', onActivities);

  const notebooksButton = document.createElement('button');
  notebooksButton.type = 'button';
  notebooksButton.className = 'btn btn--ghost';
  notebooksButton.textContent = 'Notebook Tracker';
  notebooksButton.addEventListener('click', onNotebooks);

  actions.append(undoButton, resetButton, activitiesButton, notebooksButton, settingsButton);
  header.append(backButton, titleBlock, actions);

  const grid = document.createElement('section');
  grid.className = 'team-grid';
  grid.setAttribute('aria-label', 'Teams');

  if (classroom.teams.length === 0) {
    grid.appendChild(
      createEmptyStateElement({
        message: 'No groups in this classroom yet. Add some from Settings \u2192 Groups.',
      })
    );
  } else {
    classroom.teams.forEach((team) => {
      grid.appendChild(
        createTeamCardElement(team, getTeamScore(team), {
          highlightTeamId: highlight.teamId,
          onTap: (student) => handleTap(classroom, team, student, rerender),
          onSwipeLeft: (student) => handleSwipeLeft(classroom, team, student, rerender),
          onLongPress: (student) => handleLongPress(classroom, team, student, { onSelectStudent, rerender }),
        })
      );
    });
  }

  wrapper.append(header, grid);
  container.appendChild(wrapper);

  if (highlight.studentId) {
    const pulseEl = container.querySelector(`[data-student-id="${highlight.studentId}"] .student-row__points`);
    pulseEl?.classList.add('student-row__points--pulse');
  }
}

function handleTap(classroom, team, student, rerender) {
  classModeService.awardStar(classroom, student);
  workspaceService.save(classroom);
  showToast(`+1 Star awarded to ${student.name}`);
  rerender({ studentId: student.id, teamId: team.id });
}

function handleSwipeLeft(classroom, team, student, rerender) {
  classModeService.deductPoint(classroom, student);
  workspaceService.save(classroom);
  showToast(`-1 Negative recorded for ${student.name}`);
  rerender({ studentId: student.id, teamId: team.id });
}

function handleLongPress(classroom, team, student, { onSelectStudent, rerender }) {
  openQuickActionsSheet({
    student,
    bucketOptions: classModeService.getBucketOptions(),
    onAwardBadge: () => {
      const catalog = badgeService.listCatalog(classroom);
      const availableBadges = catalog.filter((badge) => !(student.badges || []).includes(badge));
      openAwardBadgeModal({
        availableBadges,
        onAwardExisting: (badgeName) => {
          const entry = classModeService.awardBadgeQuick(classroom, student, badgeName);
          if (entry) {
            workspaceService.save(classroom);
            showToast(`${badgeName} Badge awarded`);
            rerender();
          }
        },
        onCreateAndAward: (badgeName) => {
          badgeService.addBadgeToCatalog(classroom, badgeName);
          const entry = classModeService.awardBadgeQuick(classroom, student, badgeName);
          if (entry) {
            workspaceService.save(classroom);
            showToast(`${badgeName} Badge awarded`);
            rerender();
          }
        },
      });
    },
    onAddNote: () => {
      openAddNoteModal({
        onSave: ({ teacherName, content }) => {
          noteService.addNote(student, { teacherName, content });
          workspaceService.save(classroom);
          showToast('Note added');
          rerender();
        },
      });
    },
    onChangeBucket: (bucketKey) => {
      const entry = classModeService.changeBucketQuick(classroom, student, bucketKey);
      if (entry) {
        workspaceService.save(classroom);
        showToast(`Bucket changed for ${student.name}`);
        rerender();
      }
    },
    onOpenProfile: () => onSelectStudent(student.id),
  });
}
