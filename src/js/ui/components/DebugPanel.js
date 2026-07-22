/**
 * ui/components/DebugPanel.js
 *
 * TEMPORARY, developer-only diagnostic bar pinned to the bottom of the
 * screen — for comparing state side-by-side across the laptop and
 * phone while investigating the cross-device Firestore loading issue.
 *
 * Deliberately shows the signed-in teacher's Firebase UID, not their
 * email — this app's design (see services/authService.js) treats email
 * as off-limits contact information, and an on-screen panel is a bigger
 * exposure than a console log (visible to anyone glancing at the
 * screen). UID is actually more useful for this investigation anyway:
 * it's the literal key Firestore uses (teachers/{uid}/classrooms).
 *
 * All styling is inline and self-contained here (no changes to
 * css/styles.css) so this whole feature can be removed later by
 * deleting this file and its few call sites in main.js.
 */

export function renderDebugPanel(container, { uid, projectId, classroomCount, error }) {
  container.innerHTML = '';

  Object.assign(container.style, {
    position: 'fixed',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: '9999',
    backgroundColor: '#111111',
    color: '#00ff66',
    fontFamily: 'monospace',
    fontSize: '11px',
    lineHeight: '1.4',
    padding: '6px 10px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '14px',
    borderTop: '2px solid #00ff66',
  });

  const title = document.createElement('strong');
  title.textContent = 'DEBUG';
  title.style.color = '#ffee00';
  container.appendChild(title);

  container.appendChild(createRow('UID', uid || '(not signed in)'));
  container.appendChild(createRow('Project', projectId || '(unknown)'));
  container.appendChild(createRow('Classrooms', String(classroomCount)));

  const errorRow = createRow('Error', error || '(none)');
  if (error) errorRow.style.color = '#ff5555';
  container.appendChild(errorRow);
}

function createRow(label, value) {
  const span = document.createElement('span');
  span.textContent = `${label}: ${value}`;
  return span;
}
