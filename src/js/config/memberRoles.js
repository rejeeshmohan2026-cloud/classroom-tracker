/**
 * config/memberRoles.js
 *
 * The roles a Classroom member can hold, and what each role is allowed to
 * do. This is a data-only permission matrix — no authentication exists
 * yet, so nothing in the app currently checks "the logged-in user's
 * role" against it. It exists now so that:
 *   (a) services/permissionService.js has a single source of truth to
 *       read from once a "current user" concept exists (Firebase auth),
 *       and
 *   (b) the Settings > Permissions screen has real data to display as a
 *       reference for teachers today.
 */

export const MEMBER_ROLES = Object.freeze({
  ADMINISTRATOR: 'administrator',
  TEACHER: 'teacher',
});

export const PERMISSIONS = Object.freeze({
  AWARD_POINTS: 'award_points',
  UNDO: 'undo',
  RESET_SESSION: 'reset_session',
  IMPORT_ROSTER: 'import_roster',
  EDIT_STUDENTS: 'edit_students',
  EDIT_GROUPS: 'edit_groups',
  INVITE_TEACHER: 'invite_teacher',
  REMOVE_TEACHER: 'remove_teacher',
  REMOVE_ADMINISTRATOR: 'remove_administrator',
  TRANSFER_ADMINISTRATOR: 'transfer_administrator',
  DELETE_CLASSROOM: 'delete_classroom',
});

export const ROLE_PERMISSIONS = Object.freeze({
  [MEMBER_ROLES.ADMINISTRATOR]: Object.freeze([
    PERMISSIONS.AWARD_POINTS,
    PERMISSIONS.UNDO,
    PERMISSIONS.RESET_SESSION,
    PERMISSIONS.IMPORT_ROSTER,
    PERMISSIONS.EDIT_STUDENTS,
    PERMISSIONS.EDIT_GROUPS,
    PERMISSIONS.INVITE_TEACHER,
    PERMISSIONS.REMOVE_TEACHER,
    PERMISSIONS.REMOVE_ADMINISTRATOR,
    PERMISSIONS.TRANSFER_ADMINISTRATOR,
    PERMISSIONS.DELETE_CLASSROOM,
  ]),
  [MEMBER_ROLES.TEACHER]: Object.freeze([
    PERMISSIONS.AWARD_POINTS,
    PERMISSIONS.UNDO,
    PERMISSIONS.RESET_SESSION,
    PERMISSIONS.IMPORT_ROSTER,
    PERMISSIONS.EDIT_STUDENTS,
    PERMISSIONS.EDIT_GROUPS,
    PERMISSIONS.INVITE_TEACHER,
  ]),
});
