/**
 * ui/components/JoinClassroomModal.js
 *
 * The "Join a Classroom" modal — a co-teacher's counterpart to
 * "+ New Classroom" on the same screen. Collects just the classroom
 * ID (see Settings > Teachers on the owner's side, where the code is
 * shown/copied) and calls onJoin with it; the caller
 * (services/workspaceService.js's joinClassroomByCode) resolves the
 * code, adds the caller as a teacher member, and reports back whether
 * it worked. Matches NewClassroomModal.js's structure exactly, since
 * this is the same kind of "one small step" action, not a wizard.
 */

export function openJoinClassroomModal({ onJoin }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Join a Classroom');

  const heading = document.createElement('h2');
  heading.className = 'modal__heading';
  heading.textContent = 'Join a Classroom';

  const description = document.createElement('p');
  description.className = 'modal__description';
  description.textContent = 'Ask the classroom\u2019s owner for its Classroom ID (Settings \u2192 Teachers) and enter it below.';

  const form = document.createElement('div');
  form.className = 'modal__form';

  const codeInput = createField(form, {
    label: 'Classroom ID',
    required: true,
    placeholder: 'e.g. A7F2K9',
  });

  const errorMessage = document.createElement('p');
  errorMessage.className = 'modal__error';
  errorMessage.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'modal__actions';

  const joinButton = document.createElement('button');
  joinButton.type = 'button';
  joinButton.className = 'btn btn--primary';
  joinButton.textContent = 'Join Classroom';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'btn btn--text';
  cancelButton.textContent = 'Cancel';

  function close() {
    overlay.remove();
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  joinButton.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (!code) {
      showError('Enter the Classroom ID your co-teacher shared with you.');
      codeInput.focus();
      return;
    }

    errorMessage.hidden = true;
    joinButton.disabled = true;
    joinButton.textContent = 'Joining\u2026';

    onJoin(code, {
      onSuccess: close,
      onError: (message) => {
        joinButton.disabled = false;
        joinButton.textContent = 'Join Classroom';
        showError(message);
        codeInput.focus();
      },
    });
  });

  cancelButton.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  actions.append(joinButton, cancelButton);
  modal.append(heading, description, form, errorMessage, actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  codeInput.focus();
}

function createField(form, { label, placeholder, required = false }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'modal__label';
  wrapper.textContent = label;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'modal__input';
  input.placeholder = placeholder;
  if (required) input.required = true;

  wrapper.appendChild(input);
  form.appendChild(wrapper);
  return input;
}
