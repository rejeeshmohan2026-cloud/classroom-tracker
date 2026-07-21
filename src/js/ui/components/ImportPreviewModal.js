/**
 * ui/components/ImportPreviewModal.js
 *
 * Shown after a CSV is selected: displays the detected import format,
 * lets the user override it via a dropdown, and previews the resulting
 * teams/students live as the format changes. Rendering + wiring only —
 * `getPreview(formatId)` (supplied by the caller, see main.js) does the
 * actual parsing via classroomImportService; this component just renders
 * whatever it returns.
 */

export function openImportPreviewModal({ formats, initialFormatId, getPreview, onConfirm, onCancel }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal modal--wide';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Review Import');

  const heading = document.createElement('h2');
  heading.className = 'modal__heading';
  heading.textContent = 'Review Import';

  const formatLabel = document.createElement('label');
  formatLabel.className = 'modal__label';
  formatLabel.textContent = 'Detected format \u2014 change it if this looks wrong';

  const formatSelect = document.createElement('select');
  formatSelect.className = 'modal__input';
  formats.forEach((format) => {
    const option = document.createElement('option');
    option.value = format.id;
    option.textContent = format.label;
    if (format.id === initialFormatId) option.selected = true;
    formatSelect.appendChild(option);
  });
  formatLabel.appendChild(formatSelect);

  const previewContainer = document.createElement('div');
  previewContainer.className = 'import-preview';

  const actions = document.createElement('div');
  actions.className = 'modal__actions';

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'btn btn--primary';
  confirmButton.textContent = 'Import';
  confirmButton.addEventListener('click', () => {
    close();
    onConfirm(formatSelect.value);
  });

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'btn btn--text';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    close();
    onCancel?.();
  });

  function close() {
    overlay.remove();
  }

  function renderPreview() {
    const { teams, error } = getPreview(formatSelect.value);
    previewContainer.innerHTML = '';

    if (error) {
      const errorEl = document.createElement('p');
      errorEl.className = 'import-preview__error';
      errorEl.textContent = error;
      previewContainer.appendChild(errorEl);
      confirmButton.disabled = true;
      return;
    }

    confirmButton.disabled = false;

    const summary = document.createElement('p');
    summary.className = 'import-preview__summary';
    const totalStudents = teams.reduce((sum, team) => sum + team.students.length, 0);
    summary.textContent = `${teams.length} group${teams.length === 1 ? '' : 's'} \u00b7 ${totalStudents} student${totalStudents === 1 ? '' : 's'}`;
    previewContainer.appendChild(summary);

    teams.forEach((team) => {
      const block = document.createElement('div');
      block.className = 'import-preview__team';

      const teamHeading = document.createElement('h3');
      teamHeading.className = 'import-preview__team-heading';
      teamHeading.textContent = `${team.name} (${team.students.length})`;
      block.appendChild(teamHeading);

      const studentsLine = document.createElement('p');
      studentsLine.className = 'import-preview__team-students';
      studentsLine.textContent = team.students.join(', ');
      block.appendChild(studentsLine);

      previewContainer.appendChild(block);
    });
  }

  formatSelect.addEventListener('change', renderPreview);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
      onCancel?.();
    }
  });

  actions.append(confirmButton, cancelButton);
  modal.append(heading, formatLabel, previewContainer, actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  renderPreview();
}
