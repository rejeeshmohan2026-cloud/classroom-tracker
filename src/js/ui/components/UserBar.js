/**
 * ui/components/UserBar.js
 *
 * A small persistent bar (avatar + name + Sign Out) shown above every
 * screen once a teacher is signed in — added once here, in main.js,
 * rather than duplicated into every view's own header. Rendering only;
 * the actual sign-out call lives in services/authService.js via main.js.
 */

export function renderUserBar(container, { user, onSignOut }) {
  container.innerHTML = '';
  if (!user) return;

  const bar = document.createElement('div');
  bar.className = 'user-bar';

  const identity = document.createElement('div');
  identity.className = 'user-bar__identity';

  if (user.photoURL) {
    const avatar = document.createElement('img');
    avatar.className = 'user-bar__avatar';
    avatar.src = user.photoURL;
    avatar.alt = '';
    avatar.referrerPolicy = 'no-referrer';
    identity.appendChild(avatar);
  } else {
    const fallback = document.createElement('span');
    fallback.className = 'user-bar__avatar user-bar__avatar--fallback';
    fallback.textContent = (user.displayName || 'T').charAt(0).toUpperCase();
    identity.appendChild(fallback);
  }

  const name = document.createElement('span');
  name.className = 'user-bar__name';
  name.textContent = user.displayName;
  identity.appendChild(name);

  const signOutButton = document.createElement('button');
  signOutButton.type = 'button';
  signOutButton.className = 'btn btn--text';
  signOutButton.textContent = 'Sign Out';
  signOutButton.addEventListener('click', onSignOut);

  bar.append(identity, signOutButton);
  container.appendChild(bar);
}
