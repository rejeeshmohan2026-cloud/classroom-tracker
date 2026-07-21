/**
 * ui/components/AddNoteModal.js
 *
 * Opened from the Student Profile's Notes tab. Collects the note's
 * content and the teacher's name (free text — there's no login, so the
 * app can't fill this in automatically). Rendering + wiring only.
 */

export function openAddNoteModal({ onSave }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Add Note');

  const heading = document.createElement('h2');
  heading.className = 'modal__heading';
  heading.textContent = 'Add Note';

  const form = document.createElement('div');
  form.className = 'modal__form';

  const teacherLabel = document.createElement('label');
  teacherLabel.className = 'modal__label';
  teacherLabel.textContent = 'Your name';
  const teacherInput = document.createElement('input');
  teacherInput.type = 'text';
  teacherInput.className = 'modal__input';
  teacherInput.placeholder = 'e.g. Ms. Rao';
  teacherLabel.appendChild(teacherInput);
  form.appendChild(teacherLabel);

  const contentLabel = document.createElement('label');
  contentLabel.className = 'modal__label';
  contentLabel.textContent = 'Note';
  const contentInput = document.createElement('textarea');
  contentInput.className = 'modal__input';
  contentInput.rows = 4;
  contentInput.placeholder = 'What did you observe?';
  contentLabel.appendChild(contentInput);
  form.appendChild(contentLabel);

  const actions = document.createElement('div');
  actions.className = 'modal__actions';

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'btn btn--primary';
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', () => {
    const content = contentInput.value.trim();
    if (!content) {
      window.alert('Enter some note content first.');
      return;
    }
    close();
    onSave({ teacherName: teacherInput.value.trim() || 'Teacher', content });
  });

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'btn btn--text';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', close);

  function close() {
    overlay.remove();
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  actions.append(saveButton, cancelButton);
  modal.append(heading, form, actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  teacherInput.focus();
}
