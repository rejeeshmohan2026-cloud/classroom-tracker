/**
 * ui/components/NewClassroomModal.js
 *
 * The "+ New Classroom" modal: collects only the essential classroom
 * details (School Name and Grade / Section required; Classroom Name,
 * Academic Year, and Description optional) and creates the classroom.
 * Importing students, assigning buckets, customizing groups, and
 * configuring scoring all happen afterwards in the Setup Wizard (see
 * ui/views/SetupWizardView.js) — creation itself stays a single small
 * step, per the "ask only for the essential information" brief.
 */

export function openNewClassroomModal({ onCreate }) {
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

  const actions = document.createElement('div');
  actions.className = 'modal__actions';

  const createButton = document.createElement('button');
  createButton.type = 'button';
  createButton.className = 'btn btn--primary';
  createButton.textContent = 'Create Classroom';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'btn btn--text';
  cancelButton.textContent = 'Cancel';

  function close() {
    overlay.remove();
  }

  createButton.addEventListener('click', () => {
    const schoolName = schoolNameInput.value.trim();
    const gradeSection = gradeSectionInput.value.trim();

    if (!schoolName) {
      window.alert('School Name is required.');
      schoolNameInput.focus();
      return;
    }
    if (!gradeSection) {
      window.alert('Grade / Section is required.');
      gradeSectionInput.focus();
      return;
    }

    onCreate(
      {
        schoolName,
        gradeSection,
        classroomName: classroomNameInput.value.trim(),
        academicYear: academicYearInput.value.trim(),
        description: descriptionInput.value.trim(),
      },
      close
    );
  });

  cancelButton.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  actions.append(createButton, cancelButton);
  modal.append(heading, form, actions);
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
