/**
 * ui/router.js
 *
 * A small hash-based router — no library, matching the project's
 * "vanilla only" constraint. Recognises:
 *   #/                                        -> home (or welcome, decided by main.js)
 *   #/classroom/{id}                          -> tracker
 *   #/classroom/{id}/settings/{section?}      -> settings
 *   #/classroom/{id}/setup/{step?}            -> setup wizard (no step = overview)
 *   #/classroom/{id}/student/{studentId}/{tab?} -> student profile
 *   #/classroom/{id}/activities               -> learning activities list
 *   #/classroom/{id}/activities/{activityId}  -> one activity's roster
 * Deep links work on refresh since the route is derived from the URL,
 * not from in-memory state.
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
      return { name: 'studentProfile', classroomId: parts[1], studentId: parts[3], tab: parts[4] || null };
    }
    if (parts[2] === 'activities') {
      if (parts[3]) {
        return { name: 'activityRoster', classroomId: parts[1], activityId: parts[3] };
      }
      return { name: 'activitiesList', classroomId: parts[1] };
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
