/**
 * ui/components/NewClassroomModal.js
 *
 * The "+ New Classroom" modal: collects a classroom name, then either
 * triggers a CSV file picker (Import Classroom) or creates an empty
 * classroom immediately (Create Manually). Rendering + wiring only — the
 * actual import parsing and classroom creation are handled by the
 * callbacks the caller supplies (see main.js), not by this component.
 */

export function openNewClassroomModal({ onImport, onCreateManually }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'New Classroom');

  const heading = document.createElement('h2');
  heading.className = 'modal__heading';
  heading.textContent = 'New Classroom';

  const label = document.createElement('label');
  label.className = 'modal__label';
  label.textContent = 'Classroom name';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'modal__input';
  nameInput.placeholder = 'e.g. Class VIII-A';
  label.appendChild(nameInput);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv';
  fileInput.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'modal__actions';

  const importButton = document.createElement('button');
  importButton.type = 'button';
  importButton.className = 'btn btn--primary';
  importButton.textContent = 'Import Classroom';

  const manualButton = document.createElement('button');
  manualButton.type = 'button';
  manualButton.className = 'btn btn--ghost';
  manualButton.textContent = 'Create Manually';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'btn btn--text';
  cancelButton.textContent = 'Cancel';

  function close() {
    overlay.remove();
  }

  function requireName() {
    const name = nameInput.value.trim();
    if (!name) {
      window.alert('Please enter a classroom name first.');
      nameInput.focus();
      return null;
    }
    return name;
  }

  importButton.addEventListener('click', () => {
    if (!requireName()) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    fileInput.value = '';
    if (!file) return;
    const name = requireName();
    if (!name) return;
    onImport(name, file, close);
  });

  manualButton.addEventListener('click', () => {
    const name = requireName();
    if (!name) return;
    onCreateManually(name, close);
  });

  cancelButton.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  actions.append(importButton, manualButton, cancelButton);
  modal.append(heading, label, actions, fileInput);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  nameInput.focus();
}
