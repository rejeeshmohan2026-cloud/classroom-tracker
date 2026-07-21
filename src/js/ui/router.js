/**
 * ui/router.js
 *
 * A small hash-based router — no library, matching the project's
 * "vanilla only" constraint. Recognises:
 *   #/                                   -> home (or welcome, decided by main.js)
 *   #/classroom/{id}                     -> tracker
 *   #/classroom/{id}/settings/{section?} -> settings
 *   #/classroom/{id}/setup/{step?}       -> setup wizard (no step = overview)
 *   #/classroom/{id}/student/{studentId} -> student profile
 * Deep links work on refresh (e.g. landing back on a classroom's tracker
 * or a specific settings tab/wizard step/student profile) since the
 * route is derived from the URL, not from in-memory state.
 */

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);

  if (parts[0] === 'classroom' && parts[1]) {
    if (parts[2] === 'settings') {
      return { name: 'settings', classroomId: parts[1], section: parts[3] || 'general' };
    }
    if (parts[2] === 'setup') {
      return { name: 'setup', classroomId: parts[1], step: parts[3] || null };
    }
    if (parts[2] === 'student' && parts[3]) {
      return { name: 'studentProfile', classroomId: parts[1], studentId: parts[3] };
    }
    return { name: 'tracker', classroomId: parts[1] };
  }

  return { name: 'home' };
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return parseHash();
}

export function onRouteChange(callback) {
  window.addEventListener('hashchange', () => callback(parseHash()));
}
