/**
 * models/Member.js
 *
 * Describes a Classroom member — an administrator or a teacher (see
 * config/memberRoles.js for the roles and what each can do). A Classroom
 * holds two separate lists, `administrators` and `teachers` (see
 * models/Classroom.js), so a Member's role is really "which list it's
 * in" rather than a field checked at runtime — but we still stamp
 * `role` onto the record so UI code (and a future permission check) can
 * read it without needing to know which array it came from.
 *
 * Deliberately name-only: no email, phone, or any other contact detail is
 * collected here. Real invitations (which will need a way to reach the
 * invitee — almost certainly an email address) are a Firebase-era
 * feature and must be escalated to the AI Working Committee before any
 * contact information is collected or stored. Until then, a Fellow adds
 * teachers to a classroom locally, by name, themselves.
 */

import { generateId } from '../utils/idGenerator.js';

export function createMember({ id, name, role }) {
  return {
    id: id || generateId(),
    name,
    role,
  };
}
