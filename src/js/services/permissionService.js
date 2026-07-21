/**
 * services/permissionService.js
 *
 * A pure permission check against config/memberRoles.js's matrix. Not
 * wired to any "current user" yet — there's no authentication, so there's
 * no one to check permissions against. This exists so the Settings >
 * Permissions screen has real data to display, and so future auth work
 * only needs to supply a role, not invent a permission model.
 */

import { ROLE_PERMISSIONS } from '../config/memberRoles.js';

export function canPerform(role, permission) {
  return Boolean(ROLE_PERMISSIONS[role]?.includes(permission));
}

export function listPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}
