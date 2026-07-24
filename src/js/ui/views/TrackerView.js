/**
 * ui/views/TrackerView.js
 *
 * Class Mode: the tracker is now the primary working screen during a
 * lesson. Tap a student to award a star, swipe left to deduct a point,
 * press and hold for Quick Actions (Award Badge / Add Note / Change
 * Bucket / Open Full Profile) — see ClassModeStudentRow.js and
 * QuickActionsSheet.js.
 *
 * Class Session model: every action still mutates the in-memory
 * classroom object immediately (so the UI stays live), but NOTHING is
 * written to Firestore per-action anymore — see
 * services/classSessionService.js. A session starts automatically the
 * first time this view renders for a classroom; "End Class" shows a
 * Session Review screen (counts of what happened this session), and
 * only "Save Session" there performs the one, single permanent write.
 * "Discard Session" throws every draft change away by re-fetching the
 * classroom from Firestore. Undo still reverses the single most recent
 * action of any kind (see services/classModeService.js) — it no
 * longer triggers its own save, since nothing is saved until the
 * session ends.
 */

import { createTeamCardElement } from '../components/TeamCard.js';
import { createEmptyStateElement } from '../components/EmptyState.js';
import { openQuickActionsSheet } from '../components/QuickActionsSheet.js';
import { openAwardBadgeModal } from '../components/AwardBadgeModal.js';
import { openAddNoteModal } from '../components/AddNoteModal.js';
import { showToast } from '../components/Toast.js';
import { renderSessionReview } from '../components/SessionReview.js';
import * as studentService from '../../services/studentService.js';
import * as badgeService from '../../services/badgeService.js';
import * as noteService from '../../services/noteService.js';
import * as classModeService from '../../services/classModeService.js';
import * as classSessionService from '../../services/classSessionService.js';
import { getTeamScore } from '../../services/teamService.js';
import { getDisplayName, getDisplaySubtitle } from '../../services/classroomService.js';

export function renderTrackerView(container, props) {
  const { classroom, onBack, onSettings, onActivities, onNotebooks, onSelectStudent } = props;
  const highlight = props._highlight || {};

  if (!classSessionService.isSessionActive(classroom)) {
    classSessionService.startSession(classroom);
  }

  container.innerHTML = '';

  const rerender = (nextHighlight) => {
    renderTrackerView(container, { ...props, _highlight: nextHighlight || {} });
  };

  if (props._showSessionReview) {
    renderSessionReview(container, {
      classroom,
      onContinueTeaching: () => renderTrackerView(container, { ...props, _showSessionReview: false }),
      onSaveSession: () => {
        classSessionService.commitSession(classroom);
        showToast('Session saved');
        renderTrackerView(container, { ...props, _showSessionReview: false });
      },
      onDiscardSession: async () => {
        await classSessionService.discardSession(classroom);
        showToast('Session discarded — nothing was saved');
        onBack();
      },
    });
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'tracker-view';

  const header = document.createElement('header');
  header.className = 'tracker-header';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'btn btn--text';
  backButton.textContent = '← Back';
  backButton.addEventListener('click', async () => {
    const { totalActions } = classSessionService.getSessionSummary(classroom);
    if (totalActions > 0) {
      const confirmed = window.confirm(
        `This session has ${totalActions} unsaved change${totalActions === 1 ? '' : 's'}. Leaving now without ending class will discard ${totalActions === 1 ? 'it' : 'them'}. Leave anyway?`
      );
      if (!confirmed) return;
      await classSessionService.discardSession(classroom);
    }
    onBack();
  });

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
  undoButton.className = 'btn btn--ghost btn--icon-only';
  undoButton.textContent = '\u21a9\ufe0f';
  undoButton.setAttribute('aria-label', 'Undo last action');
  undoButton.title = 'Undo';
  undoButton.disabled = !classModeService.canUndo(classroom);
  undoButton.addEventListener('click', () => {
    const undone = classModeService.undo(classroom);
    if (undone) {
      showToast('Last action undone');
      rerender();
    }
  });

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'btn btn--danger btn--icon-only';
  resetButton.textContent = '\ud83d\udd04';
  resetButton.setAttribute('aria-label', 'Reset session');
  resetButton.title = 'Reset Session';
  resetButton.disabled = !hasStudents;
  resetButton.addEventListener('click', () => {
    const confirmed = window.confirm(
      'Reset every student\u2019s score to zero for a new session? Badges, notes, buckets, and history are kept.'
    );
    if (!confirmed) return;
    studentService.resetAllScores(classroom);
    classModeService.clearUndoStack(classroom);
    showToast('Session reset');
    rerender();
  });

  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.className = 'btn btn--ghost btn--icon-only';
  settingsButton.textContent = '\u2699\ufe0f';
  settingsButton.setAttribute('aria-label', 'Settings');
  settingsButton.title = 'Settings';
  settingsButton.addEventListener('click', onSettings);

  const activitiesButton = document.createElement('button');
  activitiesButton.type = 'button';
  activitiesButton.className = 'btn btn--ghost btn--icon-only';
  activitiesButton.textContent = '\ud83d\udcda';
  activitiesButton.setAttribute('aria-label', 'Learning Activities');
  activitiesButton.title = 'Learning Activities';
  activitiesButton.addEventListener('click', onActivities);

  const notebooksButton = document.createElement('button');
  notebooksButton.type = 'button';
  notebooksButton.className = 'btn btn--ghost btn--icon-only';
  notebooksButton.textContent = '\ud83d\udcd2';
  notebooksButton.setAttribute('aria-label', 'Notebook Tracker');
  notebooksButton.title = 'Notebook Tracker';
  notebooksButton.addEventListener('click', onNotebooks);

  const endClassButton = document.createElement('button');
  endClassButton.type = 'button';
  endClassButton.className = 'btn btn--primary';
  endClassButton.textContent = 'End Class';
  endClassButton.addEventListener('click', () => {
    renderTrackerView(container, { ...props, _showSessionReview: true });
  });

  actions.append(undoButton, resetButton, activitiesButton, notebooksButton, settingsButton, endClassButton);
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
  classSessionService.recordAction(classroom, 'star');
  showToast(`+1 Star awarded to ${student.name}`);
  rerender({ studentId: student.id, teamId: team.id });
}

function handleSwipeLeft(classroom, team, student, rerender) {
  classModeService.deductPoint(classroom, student);
  classSessionService.recordAction(classroom, 'behaviour');
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
            classSessionService.recordAction(classroom, 'badge');
            showToast(`${badgeName} Badge awarded`);
            rerender();
          }
        },
        onCreateAndAward: (badgeName) => {
          badgeService.addBadgeToCatalog(classroom, badgeName);
          const entry = classModeService.awardBadgeQuick(classroom, student, badgeName);
          if (entry) {
            classSessionService.recordAction(classroom, 'badge');
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
          showToast('Note added');
          rerender();
        },
      });
    },
    onChangeBucket: (bucketKey) => {
      const entry = classModeService.changeBucketQuick(classroom, student, bucketKey);
      if (entry) {
        showToast(`Bucket changed for ${student.name}`);
        rerender();
      }
    },
    onOpenProfile: () => onSelectStudent(student.id),
  });
}
