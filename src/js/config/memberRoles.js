/**
 * config/memberRoles.js
 *
 * The roles a Classroom member can hold, and what each role is allowed
 * to do. Backed by real Google-authenticated membership for OWNER,
 * TEACHER, and VIEWER (see services/memberService.js and
 * models/Classroom.js's `members` map).
 *
 * STUDENT and PARENT are added here as provider-agnostic role
 * *identifiers* only — reserving the vocabulary a future membership
 * entry would use (`classroom.members[uid] = { role: 'student', ... }`,
 * via the same memberService.addMember() teachers already use today),
 * not an authentication mechanism. No code path currently assigns
 * either role to a real uid, and neither has any permission yet: real
 * enforcement is intentionally deferred until student/parent
 * authentication is approved (see the Student Onboarding design
 * discussion — blocked pending AI Working Committee review of Google
 * Sign-In, profile photos, and DPDP Act children's-data handling for
 * minors). When that's approved, plugging in a real identity means
 * populating this same `members` map through the same addMember() call
 * — no new membership mechanism to invent.
 */

export const MEMBER_ROLES = Object.freeze({
  OWNER: 'owner',
  TEACHER: 'teacher',
  VIEWER: 'viewer',
  STUDENT: 'student', // provider-agnostic placeholder — see file header
  PARENT: 'parent', // provider-agnostic placeholder — see file header
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
  // Both intentionally empty — see file header. Real permissions for
  // these roles are a decision for when authentication is approved, not
  // something to guess at now.
  [MEMBER_ROLES.STUDENT]: Object.freeze([]),
  [MEMBER_ROLES.PARENT]: Object.freeze([]),
});
