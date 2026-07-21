/**
 * ui/components/Toast.js
 *
 * Lightweight, subtle toast notifications for Class Mode's live
 * feedback (e.g. "+1 Star awarded to Hari"). Auto-dismisses; never
 * blocks interaction, never requires a click to close.
 */

let container = null;

function getContainer() {
  if (!container || !document.body.contains(container)) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  getContainer().appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 250);
  }, 1800);
}
