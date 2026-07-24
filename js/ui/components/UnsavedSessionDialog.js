/**
 * ui/components/UnsavedSessionDialog.js
 *
 * Shown when a teacher tries to leave Class Mode (the header's Back
 * button) while a Class Session has unsaved draft actions. A plain
 * window.confirm() only offers two choices (OK/Cancel); this needs
 * three distinct outcomes, so it's a small custom modal instead,
 * matching this app's existing modal-overlay pattern (see
 * NewClassroomModal.js).
 *
 * "Refresh the page" and "close the tab" cannot use this component —
 * browsers do not allow custom dialogs (or even custom button text)
 * on the native beforeunload prompt, for security reasons no site can
 * override. See main.js's beforeunload wiring for the native browser
 * prompt used for that specific case instead — this dialog covers
 * in-app navigation only (the Back button today; any other in-app
 * navigation away from an active session in the future).
 */

export function openUnsavedSessionDialog({ onContinueTeaching, onDiscardAndLeave, onSaveAndLeave }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Unsaved Class Session');

  const heading = document.createElement('h2');
  heading.className = 'modal__heading';
  heading.textContent = 'You have an unsaved Class Session.';

  const description = document.createElement('p');
  description.className = 'modal__description';
  description.textContent = 'Leave without saving?';

  const actions = document.createElement('div');
  actions.className = 'modal__actions modal__actions--stacked';

  function close() {
    overlay.remove();
  }

  const continueButton = document.createElement('button');
  continueButton.type = 'button';
  continueButton.className = 'btn btn--ghost';
  continueButton.textContent = 'Continue Teaching';
  continueButton.addEventListener('click', () => {
    close();
    onContinueTeaching?.();
  });

  const discardButton = document.createElement('button');
  discardButton.type = 'button';
  discardButton.className = 'btn btn--danger';
  discardButton.textContent = 'Discard & Leave';
  discardButton.addEventListener('click', () => {
    close();
    onDiscardAndLeave();
  });

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'btn btn--primary';
  saveButton.textContent = 'Save & Leave';
  saveButton.addEventListener('click', () => {
    close();
    onSaveAndLeave();
  });

  actions.append(continueButton, discardButton, saveButton);
  modal.append(heading, description, actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
