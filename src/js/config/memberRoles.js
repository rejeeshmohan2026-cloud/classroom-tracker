/**
 * config/memberRoles.js
 *
 * The roles a Classroom member can hold, and what each role is allowed
 * to do. Now backed by real Google-authenticated membership (see
 * services/memberService.js and models/Classroom.js's `members` map) —
 * previously this matrix existed but nothing checked it against an
 * actual signed-in identity.
 *
 * Renamed ADMINISTRATOR -> OWNER (every classroom now has exactly one,
 * stamped at creation — see services/classroomService.js) and added
 * VIEWER, a read-only role for future use. Real invitations (owner
 * invites a teacher, who accepts) are a later phase; this matrix is
 * shaped so adding that doesn't require touching these definitions.
 */

export const MEMBER_ROLES = Object.freeze({
  OWNER: 'owner',
  TEACHER: 'teacher',
  VIEWER: 'viewer',
});

export const PERMISSIONS = Object.freeze({
  AWARD_POINTS: 'award_points',
  UNDO: 'undo',
  RESET_SESSION: 'reset_session',
  IMPORT_ROSTER: 'import_roster',
  EDIT_STUDENTS: 'edit_students',
  EDIT_GROUPS: 'edit_groups',
  MARK_ATTENDANCE: 'mark_attendance', // future — attendance isn't built yet
  CREATE_LEARNING_ACTIVITY: 'create_learning_activity',
  INVITE_TEACHER: 'invite_teacher',
  REMOVE_TEACHER: 'remove_teacher',
  TRANSFER_OWNERSHIP: 'transfer_ownership', // future
  DELETE_CLASSROOM: 'delete_classroom',
});

export const ROLE_PERMISSIONS = Object.freeze({
  [MEMBER_ROLES.OWNER]: Object.freeze([
    PERMISSIONS.AWARD_POINTS,
    PERMISSIONS.UNDO,
    PERMISSIONS.RESET_SESSION,
    PERMISSIONS.IMPORT_ROSTER,
    PERMISSIONS.EDIT_STUDENTS,
    PERMISSIONS.EDIT_GROUPS,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.CREATE_LEARNING_ACTIVITY,
    PERMISSIONS.INVITE_TEACHER,
    PERMISSIONS.REMOVE_TEACHER,
    PERMISSIONS.TRANSFER_OWNERSHIP,
    PERMISSIONS.DELETE_CLASSROOM,
  ]),
  [MEMBER_ROLES.TEACHER]: Object.freeze([
    PERMISSIONS.AWARD_POINTS,
    PERMISSIONS.UNDO,
    PERMISSIONS.RESET_SESSION,
    PERMISSIONS.IMPORT_ROSTER,
    PERMISSIONS.EDIT_STUDENTS,
    PERMISSIONS.EDIT_GROUPS,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.CREATE_LEARNING_ACTIVITY,
  ]),
  [MEMBER_ROLES.VIEWER]: Object.freeze([]),
});
