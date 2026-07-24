/**
 * services/firebaseApp.js
 *
 * The single place Firebase's App instance gets created. Both
 * authService.js and repositories/firestoreClassroomRepository.js need
 * the *same* initialized app — Firebase throws if initializeApp() is
 * called twice for the default app — so both import getFirebaseApp()
 * from here instead of each calling initializeApp() themselves.
 */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { firebaseConfig } from '../config/firebaseConfig.js';

let app = null;

export function getFirebaseApp() {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}
