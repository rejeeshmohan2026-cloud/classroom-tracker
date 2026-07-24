/**
 * services/permissionService.js
 *
 * Permission checks against config/memberRoles.js's matrix, now wired to
 * real membership (see services/memberService.js) now that real
 * Google-authenticated identity exists. `canPerformAsUid` is the one
 * most call sites want — it looks up the uid's role on this specific
 * classroom first; `canPerform` (role-only) is kept for places that
 * already have a role in hand (e.g. the Settings > Permissions
 * reference table, which displays the whole matrix rather than checking
 * one person).
 */

import { ROLE_PERMISSIONS } from '../config/memberRoles.js';
import { getRole } from './memberService.js';

export function canPerform(role, permission) {
  return Boolean(ROLE_PERMISSIONS[role]?.includes(permission));
}

export function canPerformAsUid(classroom, uid, permission) {
  const role = getRole(classroom, uid);
  if (!role) return false;
  return canPerform(role, permission);
}

export function listPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}
