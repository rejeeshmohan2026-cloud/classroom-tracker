/**
 * ui/components/NewClassroomModal.js
 *
 * The "+ New Classroom" modal: collects classroom details (School Name
 * and Grade / Section required; Classroom Name, Academic Year, and
 * Description optional), then either triggers a CSV file picker (Import
 * Classroom) or creates an empty classroom immediately (Create
 * Manually). Rendering + wiring only — the actual import parsing and
 * classroom creation are handled by the callbacks the caller supplies
 * (see main.js), not by this component. Required-field validation here
 * is just for immediate feedback; classroomService validates again
 * before anything is created.
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

  const form = document.createElement('div');
  form.className = 'modal__form';

  const schoolNameInput = createField(form, {
    label: 'School Name',
    required: true,
    placeholder: 'e.g. CHS Kannamapet',
  });
  const gradeSectionInput = createField(form, {
    label: 'Grade / Section',
    required: true,
    placeholder: 'e.g. Grade 8A',
  });
  const classroomNameInput = createField(form, {
    label: 'Classroom Name (optional)',
    placeholder: 'e.g. Bloom Force 19',
  });
  const academicYearInput = createField(form, {
    label: 'Academic Year (optional)',
    placeholder: 'e.g. 2026\u201327',
  });
  const descriptionInput = createField(form, {
    label: 'Description (optional)',
    placeholder: 'Optional notes about the classroom',
    multiline: true,
  });

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

  function readDetails() {
    const schoolName = schoolNameInput.value.trim();
    const gradeSection = gradeSectionInput.value.trim();

    if (!schoolName) {
      window.alert('School Name is required.');
      schoolNameInput.focus();
      return null;
    }
    if (!gradeSection) {
      window.alert('Grade / Section is required.');
      gradeSectionInput.focus();
      return null;
    }

    return {
      schoolName,
      gradeSection,
      classroomName: classroomNameInput.value.trim(),
      academicYear: academicYearInput.value.trim(),
      description: descriptionInput.value.trim(),
    };
  }

  importButton.addEventListener('click', () => {
    if (!readDetails()) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    fileInput.value = '';
    if (!file) return;
    const details = readDetails();
    if (!details) return;
    onImport(details, file, close);
  });

  manualButton.addEventListener('click', () => {
    const details = readDetails();
    if (!details) return;
    onCreateManually(details, close);
  });

  cancelButton.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  actions.append(importButton, manualButton, cancelButton);
  modal.append(heading, form, actions, fileInput);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  schoolNameInput.focus();
}

function createField(form, { label, placeholder, required = false, multiline = false }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'modal__label';
  wrapper.textContent = label;

  const input = document.createElement(multiline ? 'textarea' : 'input');
  if (!multiline) input.type = 'text';
  input.className = 'modal__input';
  input.placeholder = placeholder;
  if (required) input.required = true;
  if (multiline) input.rows = 3;

  wrapper.appendChild(input);
  form.appendChild(wrapper);
  return input;
}
