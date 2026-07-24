/**
 * services/learningActivityService.js
 *
 * Learning Activities are created once at the classroom level (see
 * models/LearningActivity.js), then every student gets a status against
 * each one (see models/Student.js's `submissions` map). Matches the
 * brief's workflow exactly: a teacher creates "Plant Kingdom Worksheet"
 * once, then marks the whole roster from one screen — never editing a
 * submission from inside a single student's profile. Setting a status
 * logs a Timeline entry on that student (see services/timelineService.js),
 * so "Homework Submitted" / "Homework Missing" show up in their history
 * automatically.
 */

import { createLearningActivity } from '../models/LearningActivity.js';
import { logEntry } from './timelineService.js';

export function createActivity(classroom, { title, type, dueDate = '' }) {
  if (!classroom.learningActivities) classroom.learningActivities = [];
  const activity = createLearningActivity({ title, type, dueDate });
  classroom.learningActivities.push(activity);
  return activity;
}

export function listActivities(classroom) {
  return classroom.learningActivities || [];
}

export function getActivityById(classroom, activityId) {
  return (classroom.learningActivities || []).find((activity) => activity.id === activityId) || null;
}

export function deleteActivity(classroom, activityId) {
  const before = (classroom.learningActivities || []).length;
  classroom.learningActivities = (classroom.learningActivities || []).filter(
    (activity) => activity.id !== activityId
  );
  return classroom.learningActivities.length < before;
}

/** This student's status for one activity — 'Not Assigned' if never set. */
export function getSubmissionStatus(student, activityId) {
  return student.submissions?.[activityId]?.status || 'Not Assigned';
}

export function setSubmissionStatus(classroom, student, activityId, status, { feedback = '', score = null } = {}) {
  if (!student.submissions) student.submissions = {};

  const previousStatus = getSubmissionStatus(student, activityId);
  student.submissions[activityId] = {
    status,
    feedback,
    score,
    updatedAt: new Date().toISOString(),
  };

  if (status !== previousStatus) {
    const activity = getActivityById(classroom, activityId);
    const activityTitle = activity ? activity.title : 'Learning Activity';
    logEntry(student, { kind: 'activity', label: `${activityTitle} ${status}` });
  }

  return student.submissions[activityId];
}

/** Tally of every student's status for one activity, across the whole classroom roster. */
export function getActivityRosterSummary(classroom, activityId) {
  const summary = {
    Submitted: 0,
    'Submitted Late': 0,
    Missing: 0,
    Resubmitted: 0,
    'Not Assigned': 0,
  };

  classroom.teams.forEach((team) => {
    team.students.forEach((student) => {
      const status = getSubmissionStatus(student, activityId);
      summary[status] = (summary[status] || 0) + 1;
    });
  });

  return summary;
}

/** Tally of this student's statuses across every Learning Activity. */
export function getSubmissionSummary(classroom, student) {
  const summary = {
    Submitted: 0,
    'Submitted Late': 0,
    Missing: 0,
    Resubmitted: 0,
    'Not Assigned': 0,
  };

  (classroom.learningActivities || []).forEach((activity) => {
    const status = getSubmissionStatus(student, activity.id);
    summary[status] = (summary[status] || 0) + 1;
  });

  return summary;
}
