/**
 * ui/router.js
 *
 * A small hash-based router — no library, matching the project's
 * "vanilla only" constraint. Recognises:
 *   #/                                   -> home (or welcome, decided by main.js)
 *   #/classroom/{id}                     -> tracker
 *   #/classroom/{id}/settings/{section?} -> settings
 *
 * Deep links work on refresh (e.g. landing back on a classroom's tracker
 * or a specific settings tab) since the route is derived from the URL,
 * not from in-memory state.
 */

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);

  if (parts[0] === 'classroom' && parts[1]) {
    if (parts[2] === 'settings') {
      return { name: 'settings', classroomId: parts[1], section: parts[3] || 'general' };
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
