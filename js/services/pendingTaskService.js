/**
 * services/pendingTaskService.js
 *
 * Runs every checker registered below against a classroom and returns
 * what's outstanding — the data the Classroom Dashboard's Pending Tasks
 * widget (Phase 2) will render. Read-only, same as
 * services/studentProgressService.js: nothing here writes to Firestore.
 *
 * Each checker is keyed by a config/pendingTaskTypes.js id. Adding a new
 * task type later means adding one entry to that config file and one
 * new checker function here — getPendingTasks() picks it up
 * automatically, no widget changes needed.
 *
 * Definitions (judgment calls, documented since "pending" is inherently
 * a bit subjective):
 *   - "Notebook not checked today": a configured Subject × Notebook Type
 *     pair with zero register entries for today's date. A pair with no
 *     students marked at all today is exactly the situation this task
 *     type exists to surface.
 *   - "Activities awaiting completion": a Learning Activity with at
 *     least one student still at status 'Not Assigned' — the teacher
 *     hasn't finished marking the whole roster for it yet.
 *   - "Homework awaiting review": a notebook entry within the last 7
 *     days where a student submitted (`submission === 'submitted'`) but
 *     the teacher hasn't yet assessed it (`completion` is still null).
 *     Deliberately not restricted to notebook types literally named
 *     "Homework" — matching by name would be fragile (a classroom might
 *     call it "Classwork" or something else entirely) and the situation
 *     ("submitted, not yet checked") is the same regardless of what the
 *     notebook type is called.
 */

import * as notebookConfigService from './notebookConfigService.js';
import * as notebookService from './notebookService.js';
import * as learningActivityService from './learningActivityService.js';
import { getTodayDateKey, shiftDateKey, formatDateKey } from '../utils/dateHelpers.js';
import { PENDING_TASK_TYPES } from '../config/pendingTaskTypes.js';

function checkNotebookNotCheckedToday(classroom) {
  const today = getTodayDateKey();
  const items = [];

  notebookConfigService.listSubjects(classroom).forEach((subject) => {
    notebookConfigService.listNotebookTypes(classroom, subject.id).forEach((notebookType) => {
      const todayEntries = notebookService.getRegisterForDate(classroom, subject.id, notebookType.id, today);
      if (Object.keys(todayEntries).length === 0) {
        items.push({
          subjectId: subject.id,
          notebookTypeId: notebookType.id,
          description: `${subject.name} \u00b7 ${notebookType.name}`,
        });
      }
    });
  });

  return items;
}

function checkActivitiesAwaitingCompletion(classroom) {
  const items = [];

  learningActivityService.listActivities(classroom).forEach((activity) => {
    const summary = learningActivityService.getActivityRosterSummary(classroom, activity.id);
    const notAssignedCount = summary['Not Assigned'] || 0;
    if (notAssignedCount > 0) {
      items.push({
        activityId: activity.id,
        description: activity.title,
        count: notAssignedCount,
      });
    }
  });

  return items;
}

function checkHomeworkAwaitingReview(classroom) {
  const today = getTodayDateKey();
  const lookbackStart = shiftDateKey(today, -6); // last 7 days, inclusive of today
  const items = [];

  notebookConfigService.listSubjects(classroom).forEach((subject) => {
    notebookConfigService.listNotebookTypes(classroom, subject.id).forEach((notebookType) => {
      let dateKey = lookbackStart;
      while (dateKey <= today) {
        const dateEntries = notebookService.getRegisterForDate(classroom, subject.id, notebookType.id, dateKey);
        const awaitingCount = Object.values(dateEntries).filter(
          (entry) => entry.submission === 'submitted' && entry.completion === null
        ).length;

        if (awaitingCount > 0) {
          items.push({
            subjectId: subject.id,
            notebookTypeId: notebookType.id,
            dateKey,
            description: `${subject.name} \u00b7 ${notebookType.name} (${formatDateKey(dateKey)})`,
            count: awaitingCount,
          });
        }

        dateKey = shiftDateKey(dateKey, 1);
      }
    });
  });

  return items;
}

const CHECKERS = {
  notebook_not_checked_today: checkNotebookNotCheckedToday,
  activity_awaiting_completion: checkActivitiesAwaitingCompletion,
  homework_awaiting_review: checkHomeworkAwaitingReview,
};

/**
 * Runs every registered checker and returns one entry per task type that
 * found anything outstanding — task types with nothing pending are
 * omitted entirely, so the (future) widget only ever has to render "here's
 * what's outstanding," never an empty/zero-count group.
 */
export function getPendingTasks(classroom) {
  return PENDING_TASK_TYPES.map((taskType) => {
    const checker = CHECKERS[taskType.id];
    const items = checker ? checker(classroom) : [];
    return { ...taskType, items };
  }).filter((group) => group.items.length > 0);
}
