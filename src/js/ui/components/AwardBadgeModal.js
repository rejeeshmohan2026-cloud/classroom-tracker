/**
 * ui/components/AwardBadgeModal.js
 *
 * Opened from the Student Profile's Achievements tab. Lets a teacher
 * choose an existing badge from the classroom's catalog, or type a new
 * one (which both adds it to the catalog and awards it in one step).
 * Rendering + wiring only — the caller (see ui/views/StudentProfileView.js)
 * supplies onAwardExisting/onCreateAndAward and re-renders afterwards.
 */

export function openAwardBadgeModal({ availableBadges, onAwardExisting, onCreateAndAward }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Award Badge');

  const heading = document.createElement('h2');
  heading.className = 'modal__heading';
  heading.textContent = 'Award Badge';

  function close() {
    overlay.remove();
  }

  const body = document.createElement('div');
  body.className = 'modal__form';

  if (availableBadges.length > 0) {
    const existingLabel = document.createElement('label');
    existingLabel.className = 'modal__label';
    existingLabel.textContent = 'Choose an existing badge';

    const select = document.createElement('select');
    select.className = 'modal__input';
    availableBadges.forEach((badgeName) => {
      const option = document.createElement('option');
      option.value = badgeName;
      option.textContent = badgeName;
      select.appendChild(option);
    });
    existingLabel.appendChild(select);
    body.appendChild(existingLabel);

    const awardButton = document.createElement('button');
    awardButton.type = 'button';
    awardButton.className = 'btn btn--primary';
    awardButton.textContent = 'Award';
    awardButton.addEventListener('click', () => {
      close();
      onAwardExisting(select.value);
    });
    body.appendChild(awardButton);

    const divider = document.createElement('p');
    divider.className = 'modal__divider';
    divider.textContent = 'or';
    body.appendChild(divider);
  } else {
    const noneMessage = document.createElement('p');
    noneMessage.className = 'profile-section__meta';
    noneMessage.textContent = 'This student already has every badge in the catalog. Create a new one below.';
    body.appendChild(noneMessage);
  }

  const newLabel = document.createElement('label');
  newLabel.className = 'modal__label';
  newLabel.textContent = 'Create a new badge';

  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.className = 'modal__input';
  newInput.placeholder = 'e.g. Good Communicator';
  newLabel.appendChild(newInput);
  body.appendChild(newLabel);

  const createButton = document.createElement('button');
  createButton.type = 'button';
  createButton.className = 'btn btn--ghost';
  createButton.textContent = 'Create & Award';
  createButton.addEventListener('click', () => {
    const name = newInput.value.trim();
    if (!name) {
      window.alert('Enter a name for the new badge.');
      return;
    }
    close();
    onCreateAndAward(name);
  });
  body.appendChild(createButton);

  const actions = document.createElement('div');
  actions.className = 'modal__actions';
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'btn btn--text';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', close);
  actions.appendChild(cancelButton);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  modal.append(heading, body, actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  newInput.focus();
}
