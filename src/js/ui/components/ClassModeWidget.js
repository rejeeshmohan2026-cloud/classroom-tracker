/**
 * ui/components/ClassModeWidget.js
 *
 * The Dashboard's entry point into Class Mode — a prominent call to
 * action, not a data widget. Class Mode itself (ui/views/TrackerView.js)
 * is completely unmodified by this phase; only where you get to it from
 * has changed.
 */

export function createClassModeWidgetElement({ onStartClassMode }) {
  const widget = document.createElement('div');
  widget.className = 'dashboard-widget dashboard-widget--cta';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--primary dashboard-widget__cta-button';
  button.textContent = '\u25b6 Start Class Mode';
  button.addEventListener('click', onStartClassMode);

  widget.appendChild(button);
  return widget;
}
