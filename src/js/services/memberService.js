/**
 * services/memberService.js
 *
 * Operations on a Classroom's members — its `administrators` and
 * `teachers` lists (see models/Member.js and models/Classroom.js).
 * Name-only, no contact details: see models/Member.js for why, and
 * escalate to the AI Working Committee before adding any real invitation
 * mechanism that would need one.
 *
 * No authentication exists yet, so nothing here checks "who is asking" —
 * see services/permissionService.js for the permission matrix these
 * rules are drawn from, ready to be enforced once a current-user concept
 * exists.
 */

import { createMember } from '../models/Member.js';
import { MEMBER_ROLES } from '../config/memberRoles.js';

function listForRole(classroom, role) {
  return role === MEMBER_ROLES.ADMINISTRATOR ? classroom.administrators : classroom.teachers;
}

export function listMembers(classroom) {
  return [
    ...classroom.administrators.map((member) => ({ ...member, role: MEMBER_ROLES.ADMINISTRATOR })),
    ...classroom.teachers.map((member) => ({ ...member, role: MEMBER_ROLES.TEACHER })),
  ];
}

export function addMember(classroom, name, role) {
  const member = createMember({ name, role });
  listForRole(classroom, role).push(member);
  return member;
}

/**
 * Removes a member. Refuses to remove the classroom's last administrator
 * — every classroom must keep at least one — and returns false in that
 * case rather than throwing, so the UI can show a plain message.
 */
export function removeMember(classroom, memberId) {
  const isLastAdministrator =
    classroom.administrators.length === 1 &&
    classroom.administrators[0].id === memberId;

  if (isLastAdministrator) return false;

  const beforeAdmins = classroom.administrators.length;
  classroom.administrators = classroom.administrators.filter((m) => m.id !== memberId);
  if (classroom.administrators.length < beforeAdmins) return true;

  const beforeTeachers = classroom.teachers.length;
  classroom.teachers = classroom.teachers.filter((m) => m.id !== memberId);
  return classroom.teachers.length < beforeTeachers;
}
