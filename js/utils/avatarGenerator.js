/**
 * utils/avatarGenerator.js
 *
 * Generates a visual identity from a name alone — initials plus a
 * deterministic color, no photo storage, no Firebase Storage
 * integration. Platform-level (not Classroom Tracker- or Student
 * Portal-specific): both already show a person's initials in a
 * colored circle in different places (RecognitionCard.js, TeamCard's
 * huddle avatars, UserBar's fallback avatar) — this centralizes that
 * pattern into one shared, tested implementation instead of each
 * screen re-deriving its own initials/color logic.
 *
 * Deliberately shaped so photo support could be added later without
 * changing any caller: every result has a `type` field
 * ('generated' today; a future 'photo' variant would carry a `url`
 * instead of `initials`/`color`). A caller should always branch on
 * `type`, never assume `initials`/`color` exist — see
 * getAvatarForPerson()'s own doc comment below.
 */

const AVATAR_COLORS = [
  '#1565c0', // Classic blue
  '#256f59', // Emerald
  '#6b4fa8', // Plum
  '#d9762e', // Sunset
  '#ef5879', // Pink (Community)
  '#c9971f', // Gold
];

/** A simple, deterministic string hash — same name always maps to the same color, without needing to store one. */
function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // keep it a 32-bit int
  }
  return Math.abs(hash);
}

export function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorForName(name) {
  const index = hashString(name || '') % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * The one function every caller should use — not getInitials()/
 * getColorForName() directly — so that adding real photo support
 * later is a change to this one function, not to every screen that
 * shows an avatar.
 *
 * Returns either:
 *   { type: 'generated', initials, color }  (always, today)
 *   { type: 'photo', url }                  (future — once a
 *     `photoUrl` field genuinely exists on a person record, this
 *     function would check for it first and return this shape
 *     instead; no caller changes needed as long as they already
 *     branch on `type`)
 */
export function getAvatarForPerson(person) {
  const name = person?.name || person?.displayName || '';
  return {
    type: 'generated',
    initials: getInitials(name),
    color: getColorForName(name),
  };
}
