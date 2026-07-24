/**
 * ui/components/LogParticipationModal.js
 *
 * Opened from the Student Profile's Activity tab. Positive/Negative
 * toggle, a point value, and a reason — matching the brief's field list
 * exactly. Rendering + wiring only.
 */

export function openLogParticipationModal({ onSave }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Log Participation');

  const heading = document.createElement('h2');
  heading.className = 'modal__heading';
  heading.textContent = 'Log Participation';

  const form = document.createElement('div');
  form.className = 'modal__form';

  const toggleWrapper = document.createElement('div');
  toggleWrapper.className = 'modal__toggle-group';

  let isPositive = true;
  const positiveButton = document.createElement('button');
  positiveButton.type = 'button';
  positiveButton.className = 'modal__toggle modal__toggle--active';
  positiveButton.textContent = 'Positive';

  const negativeButton = document.createElement('button');
  negativeButton.type = 'button';
  negativeButton.className = 'modal__toggle';
  negativeButton.textContent = 'Negative';

  positiveButton.addEventListener('click', () => {
    isPositive = true;
    positiveButton.classList.add('modal__toggle--active');
    negativeButton.classList.remove('modal__toggle--active');
  });
  negativeButton.addEventListener('click', () => {
    isPositive = false;
    negativeButton.classList.add('modal__toggle--active');
    positiveButton.classList.remove('modal__toggle--active');
  });

  toggleWrapper.append(positiveButton, negativeButton);
  form.appendChild(toggleWrapper);

  const pointsLabel = document.createElement('label');
  pointsLabel.className = 'modal__label';
  pointsLabel.textContent = 'Points';
  const pointsInput = document.createElement('input');
  pointsInput.type = 'number';
  pointsInput.min = '1';
  pointsInput.value = '1';
  pointsInput.className = 'modal__input';
  pointsLabel.appendChild(pointsInput);
  form.appendChild(pointsLabel);

  const reasonLabel = document.createElement('label');
  reasonLabel.className = 'modal__label';
  reasonLabel.textContent = 'Reason';
  const reasonInput = document.createElement('input');
  reasonInput.type = 'text';
  reasonInput.className = 'modal__input';
  reasonInput.placeholder = 'e.g. Correct Answer';
  reasonLabel.appendChild(reasonInput);
  form.appendChild(reasonLabel);

  const actions = document.createElement('div');
  actions.className = 'modal__actions';

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'btn btn--primary';
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', () => {
    const magnitude = Math.abs(Number(pointsInput.value));
    const reason = reasonInput.value.trim();

    if (!Number.isFinite(magnitude) || magnitude <= 0) {
      window.alert('Enter a point value greater than zero.');
      return;
    }
    if (!reason) {
      window.alert('Enter a reason for this entry.');
      return;
    }

    close();
    onSave({ delta: isPositive ? magnitude : -magnitude, reason });
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
  reasonInput.focus();
}
