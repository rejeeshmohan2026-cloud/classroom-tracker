/**
 * ui/components/EmptyState.js
 *
 * A generic "nothing here yet" message, used wherever a list is legitimately
 * empty (e.g. a classroom with no groups yet). Takes its message as a prop
 * rather than hardcoding one, since it's now reused in more than one place.
 */

export function createEmptyStateElement({ message = 'Nothing here yet.' } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'empty-state';

  const text = document.createElement('p');
  text.className = 'empty-state__message';
  text.textContent = message;

  wrapper.appendChild(text);
  return wrapper;
}
