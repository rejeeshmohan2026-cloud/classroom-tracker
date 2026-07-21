/**
 * services/badgeService.js
 *
 * Manages a classroom's reusable badge catalog and the badges awarded to
 * individual students. Awarding a badge also logs a Participation
 * History entry (see services/participationService.js), matching the
 * "Badge Awarded" timeline example in the brief. Revoking a badge only
 * removes the student's current badge status — the history entry stays,
 * since Participation History is an append-only record of what happened.
 */

import { logEntry } from './participationService.js';

export function listCatalog(classroom) {
  return classroom.settings.badgeCatalog || [];
}

export function addBadgeToCatalog(classroom, name) {
  if (!classroom.settings.badgeCatalog) classroom.settings.badgeCatalog = [];
  const trimmed = name.trim();
  if (!trimmed) return false;

  const alreadyExists = classroom.settings.badgeCatalog.some(
    (badge) => badge.toLowerCase() === trimmed.toLowerCase()
  );
  if (alreadyExists) return false;

  classroom.settings.badgeCatalog.push(trimmed);
  return true;
}

export function removeBadgeFromCatalog(classroom, name) {
  const before = classroom.settings.badgeCatalog.length;
  classroom.settings.badgeCatalog = classroom.settings.badgeCatalog.filter((badge) => badge !== name);
  return classroom.settings.badgeCatalog.length < before;
}

export function awardBadge(student, badgeName) {
  if (!student.badges) student.badges = [];
  if (student.badges.includes(badgeName)) return false;

  student.badges.push(badgeName);
  logEntry(student, { kind: 'badge', label: badgeName, delta: 0 });
  return true;
}

export function revokeBadge(student, badgeName) {
  const before = student.badges.length;
  student.badges = student.badges.filter((badge) => badge !== badgeName);
  return student.badges.length < before;
}
