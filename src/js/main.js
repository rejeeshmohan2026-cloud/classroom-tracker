/**
 * main.js
 *
 * Application entry point. Sprint 4 added the auth gate; Sprint 5 swaps
 * classroom storage from localStorage to Firestore (see
 * services/workspaceService.js and repositories/firestoreClassroomRepository.js)
 * without changing anything about how views render — workspaceService's
 * public shape (getState/getClassroomById/createClassroom/etc.) is the
 * same as before, so views didn't need to change except passing the
 * classroom being saved (see workspaceService.save(classroom)).
 *
 * Once signed in, workspaceService.initForUser() subscribes to that
 * teacher's classrooms in real time; its callback re-renders the
 * current route automatically whenever the data changes — including
 * from another signed-in device — so nothing here ever needs a manual
 * refresh.
 */

import * as workspaceService from './services/workspaceService.js';
import * as authService from './services/authService.js';
import { ClassroomValidationError } from './services/classroomService.js';
import * as router from './ui/router.js';
import { renderWelcomeView } from './ui/views/WelcomeView.js';
import { renderHomeView } from './ui/views/HomeView.js';
import { renderTrackerView } from './ui/views/TrackerView.js';
import { renderSettingsView } from './ui/views/SettingsView.js';
import { renderSetupWizardView } from './ui/views/SetupWizardView.js';
import { renderStudentProfileView } from './ui/views/StudentProfileView.js';
import { renderActivitiesListView, renderActivityRosterView } from './ui/views/ActivitiesView.js';
import { renderLoginView } from './ui/views/LoginView.js';
import { renderUserBar } from './ui/components/UserBar.js';
import { openNewClassroomModal } from './ui/components/NewClassroomModal.js';
// TEMPORARY, for the cross-device investigation — remove these two
// imports along with initDebugPanel()/updateDebugPanel() below, and
// delete ui/components/DebugPanel.js, once done.
import { renderDebugPanel } from './ui/components/DebugPanel.js';
import { getFirebaseApp } from './services/firebaseApp.js';

let appContainer = null;
let userBarContainer = null;
// TEMPORARY debug-panel state — see note above.
let debugPanelContainer = null;
const debugState = { uid: null, projectId: null, classroomCount: 0, error: null };

function updateDebugPanel() {
  renderDebugPanel(debugPanelContainer, debugState);
}
let currentUser = null;
let workspaceLoading = false;

function handleSignIn() {
  authService.signInWithGoogle().catch((error) => {
    console.error('[main] Sign-in failed:', error);
    window.alert('Sign-in didn\u2019t complete. Please try again.');
  });
}

function handleSignOut() {
  authService.signOutUser().catch((error) => {
    console.error('[main] Sign-out failed:', error);
  });
}

function handleNewClassroom() {
  openNewClassroomModal({
    onCreate: (details, close) => {
      try {
        const classroom = workspaceService.createClassroom(details);
        close();
        router.navigate(`/classroom/${classroom.id}/setup`);
      } catch (error) {
        const message =
          error instanceof ClassroomValidationError
            ? error.message
            : 'Something went wrong creating that classroom.';
        window.alert(message);
      }
    },
  });
}

const CLASSROOM_ROUTE_NAMES = [
  'tracker',
  'settings',
  'setup',
  'studentProfile',
  'activitiesList',
  'activityRoster',
];

function renderLoadingScreen(container) {
  container.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'welcome-view';
  const message = document.createElement('p');
  message.className = 'welcome-view__subtitle';
  message.textContent = 'Loading your classrooms\u2026';
  wrapper.appendChild(message);
  container.appendChild(wrapper);
}

function renderRoute(route) {
  if (!currentUser) {
    userBarContainer.innerHTML = '';
    renderLoginView(appContainer, { onSignIn: handleSignIn });
    return;
  }

  renderUserBar(userBarContainer, { user: currentUser, onSignOut: handleSignOut });

  if (workspaceLoading) {
    renderLoadingScreen(appContainer);
    return;
  }

  if (CLASSROOM_ROUTE_NAMES.includes(route.name)) {
    const classroom = workspaceService.getClassroomById(route.classroomId);
    if (!classroom) {
      router.navigate('/');
      return;
    }

    if (route.name === 'tracker') {
      renderTrackerView(appContainer, {
        classroom,
        onBack: () => router.navigate('/'),
        onSettings: () => router.navigate(`/classroom/${classroom.id}/settings`),
        onActivities: () => router.navigate(`/classroom/${classroom.id}/activities`),
        onSelectStudent: (studentId) => router.navigate(`/classroom/${classroom.id}/student/${studentId}`),
      });
    } else if (route.name === 'settings') {
      renderSettingsView(appContainer, {
        classroom,
        section: route.section,
        onBack: () => router.navigate(`/classroom/${classroom.id}`),
        onNavigateSection: (section) =>
          router.navigate(`/classroom/${classroom.id}/settings/${section}`),
        onDeleted: () => router.navigate('/'),
        onReopenSetupWizard: () => router.navigate(`/classroom/${classroom.id}/setup`),
      });
    } else if (route.name === 'setup') {
      renderSetupWizardView(appContainer, {
        classroom,
        step: route.step,
        onNavigateStep: (step) =>
          router.navigate(step ? `/classroom/${classroom.id}/setup/${step}` : `/classroom/${classroom.id}/setup`),
        onFinish: () => router.navigate(`/classroom/${classroom.id}`),
      });
    } else if (route.name === 'studentProfile') {
      renderStudentProfileView(appContainer, {
        classroom,
        studentId: route.studentId,
        tab: route.tab,
        onBack: () => router.navigate(`/classroom/${classroom.id}`),
        onNavigateTab: (tab) => router.navigate(`/classroom/${classroom.id}/student/${route.studentId}/${tab}`),
      });
    } else if (route.name === 'activitiesList') {
      renderActivitiesListView(appContainer, {
        classroom,
        onBack: () => router.navigate(`/classroom/${classroom.id}`),
        onSelectActivity: (activityId) =>
          router.navigate(`/classroom/${classroom.id}/activities/${activityId}`),
      });
    } else {
      renderActivityRosterView(appContainer, {
        classroom,
        activityId: route.activityId,
        onBack: () => router.navigate(`/classroom/${classroom.id}/activities`),
      });
    }
    return;
  }

  const { classrooms } = workspaceService.getState();
  // TEMPORARY DEBUG LOGGING — remove after cross-device investigation.
  console.log('[MAIN]');
  console.log('Current classroom count:', classrooms.length);
  if (classrooms.length === 0) {
    renderWelcomeView(appContainer, { onNewClassroom: handleNewClassroom });
  } else {
    renderHomeView(appContainer, {
      classrooms,
      onSelectClassroom: (id) => router.navigate(`/classroom/${id}`),
      onNewClassroom: handleNewClassroom,
    });
  }
}

function init() {
  appContainer = document.getElementById('app');
  userBarContainer = document.getElementById('user-bar');

  // TEMPORARY debug panel setup — see note near the top of this file.
  debugPanelContainer = document.createElement('div');
  document.body.appendChild(debugPanelContainer);
  updateDebugPanel();

  // Registered once — renderRoute() itself checks auth/loading state on
  // every call, so this doesn't need to be re-attached on sign-in/out.
  router.onRouteChange(renderRoute);

  authService.initAuth();
  // TEMPORARY — project ID doesn't depend on sign-in state, so grab it once.
  debugState.projectId = getFirebaseApp().options.projectId || null;
  updateDebugPanel();

  authService.onAuthStateChange((user) => {
    currentUser = user;

    // TEMPORARY debug panel update.
    debugState.uid = user?.uid || null;
    if (!user) {
      debugState.classroomCount = 0;
      debugState.error = null;
    }
    updateDebugPanel();

    if (!user) {
      workspaceService.stopListening();
      renderRoute(router.getCurrentRoute());
      return;
    }

    workspaceLoading = true;
    renderRoute(router.getCurrentRoute());

    workspaceService
      .initForUser(
        user.uid,
        () => {
          workspaceLoading = false;
          // TEMPORARY debug panel update.
          debugState.classroomCount = workspaceService.getState().classrooms.length;
          debugState.error = null;
          updateDebugPanel();
          renderRoute(router.getCurrentRoute());
        },
        (error) => {
          // TEMPORARY — surfaces snapshot-level errors to the debug panel.
          debugState.error = error?.message || String(error);
          updateDebugPanel();
        }
      )
      .catch((error) => {
        console.error('[main] Failed to load classrooms:', error);
        workspaceLoading = false;
        // TEMPORARY debug panel update.
        debugState.error = error?.message || String(error);
        updateDebugPanel();
        window.alert('We couldn\u2019t load your classrooms. Please check your connection and try again.');
        renderRoute(router.getCurrentRoute());
      });
  });
}

document.addEventListener('DOMContentLoaded', init);
