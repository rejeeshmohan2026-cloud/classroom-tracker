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
import * as continueWorkingService from './services/continueWorkingService.js';
import { ClassroomValidationError } from './services/classroomService.js';
import * as router from './ui/router.js';
import { renderWelcomeView } from './ui/views/WelcomeView.js';
import { renderHomeView } from './ui/views/HomeView.js';
import { renderTrackerView } from './ui/views/TrackerView.js';
import { renderSettingsView } from './ui/views/SettingsView.js';
import { renderSetupWizardView } from './ui/views/SetupWizardView.js';
import { renderStudentProfileView } from './ui/views/StudentProfileView.js';
import { renderActivitiesListView, renderActivityRosterView } from './ui/views/ActivitiesView.js';
import { renderNotebookTrackerView } from './ui/views/NotebookTrackerView.js';
import { renderNotebookRegisterView } from './ui/views/NotebookRegisterView.js';
import { renderNotebookTimelineView } from './ui/views/NotebookTimelineView.js';
import { renderDashboardView } from './ui/views/DashboardView.js';
import { renderRecognitionScreenView } from './ui/views/RecognitionScreenView.js';
import { renderLoginView } from './ui/views/LoginView.js';
import { renderUserBar } from './ui/components/UserBar.js';
import { openNewClassroomModal } from './ui/components/NewClassroomModal.js';

let appContainer = null;
let userBarContainer = null;
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
        const classroom = workspaceService.createClassroom(details, currentUser);
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
  'dashboard',
  'tracker',
  'recognition',
  'settings',
  'setup',
  'studentProfile',
  'activitiesList',
  'activityRoster',
  'notebookTracker',
  'notebookRegister',
  'notebookTimeline',
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

    if (route.name === 'dashboard') {
      renderDashboardView(appContainer, {
        classroom,
        currentUser,
        onOpenSettings: () => router.navigate(`/classroom/${classroom.id}/settings`),
        onOpenNotebookTracker: () => router.navigate(`/classroom/${classroom.id}/notebooks`),
        onOpenGroups: () => router.navigate(`/classroom/${classroom.id}/settings/groups`),
        onStartClassMode: () => router.navigate(`/classroom/${classroom.id}/class-mode`),
        onSelectNotebook: (subjectId, notebookTypeId) =>
          router.navigate(`/classroom/${classroom.id}/notebooks/${subjectId}/${notebookTypeId}`),
        onOpenRecognition: () => router.navigate(`/classroom/${classroom.id}/recognition`),
        onOpenActivities: () => router.navigate(`/classroom/${classroom.id}/activities`),
        onSelectPendingTask: (taskTypeId, item) => {
          if (item.activityId) {
            router.navigate(`/classroom/${classroom.id}/activities/${item.activityId}`);
          } else if (item.subjectId && item.notebookTypeId) {
            const dateSegment = item.dateKey ? `/${item.dateKey}` : '';
            router.navigate(`/classroom/${classroom.id}/notebooks/${item.subjectId}/${item.notebookTypeId}${dateSegment}`);
          }
        },
      });
    } else if (route.name === 'recognition') {
      renderRecognitionScreenView(appContainer, {
        classroom,
        period: route.period,
        categoryId: route.categoryId,
        onBack: () => router.navigate(`/classroom/${classroom.id}`),
        onNavigatePeriod: (period) => router.navigate(`/classroom/${classroom.id}/recognition/${period}`),
        onNavigateCategory: (period, categoryId) =>
          router.navigate(`/classroom/${classroom.id}/recognition/${period}/${categoryId}`),
      });
    } else if (route.name === 'tracker') {
      renderTrackerView(appContainer, {
        classroom,
        onBack: () => router.navigate(`/classroom/${classroom.id}`),
        onSettings: () => router.navigate(`/classroom/${classroom.id}/settings`),
        onActivities: () => router.navigate(`/classroom/${classroom.id}/activities`),
        onNotebooks: () => router.navigate(`/classroom/${classroom.id}/notebooks`),
        onSelectStudent: (studentId) => router.navigate(`/classroom/${classroom.id}/student/${studentId}`),
      });
    } else if (route.name === 'settings') {
      renderSettingsView(appContainer, {
        classroom,
        currentUser,
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
    } else if (route.name === 'activityRoster') {
      renderActivityRosterView(appContainer, {
        classroom,
        activityId: route.activityId,
        onBack: () => router.navigate(`/classroom/${classroom.id}/activities`),
      });
    } else if (route.name === 'notebookTracker') {
      renderNotebookTrackerView(appContainer, {
        classroom,
        onBack: () => router.navigate(`/classroom/${classroom.id}`),
        onSelectNotebook: (subjectId, notebookTypeId) =>
          router.navigate(`/classroom/${classroom.id}/notebooks/${subjectId}/${notebookTypeId}`),
      });
    } else if (route.name === 'notebookRegister') {
      continueWorkingService.recordRecentNotebook(currentUser?.uid, {
        classroomId: classroom.id,
        subjectId: route.subjectId,
        notebookTypeId: route.notebookTypeId,
      });
      renderNotebookRegisterView(appContainer, {
        classroom,
        subjectId: route.subjectId,
        notebookTypeId: route.notebookTypeId,
        dateKey: route.dateKey,
        currentUser,
        onBack: () => router.navigate(`/classroom/${classroom.id}/notebooks`),
        onNavigateDate: (dateKey) =>
          router.navigate(`/classroom/${classroom.id}/notebooks/${route.subjectId}/${route.notebookTypeId}/${dateKey}`),
        onOpenTimeline: () =>
          router.navigate(`/classroom/${classroom.id}/notebooks/${route.subjectId}/${route.notebookTypeId}/timeline`),
      });
    } else {
      renderNotebookTimelineView(appContainer, {
        classroom,
        subjectId: route.subjectId,
        notebookTypeId: route.notebookTypeId,
        yearMonth: route.yearMonth,
        onBack: () => router.navigate(`/classroom/${classroom.id}/notebooks/${route.subjectId}/${route.notebookTypeId}`),
        onNavigateMonth: (yearMonth) =>
          router.navigate(`/classroom/${classroom.id}/notebooks/${route.subjectId}/${route.notebookTypeId}/timeline/${yearMonth}`),
      });
    }
    return;
  }

  const { classrooms } = workspaceService.getState();
  console.log('[main] Home/Welcome decision — classroom count:', classrooms.length);
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

  // Registered once — renderRoute() itself checks auth/loading state on
  // every call, so this doesn't need to be re-attached on sign-in/out.
  router.onRouteChange(renderRoute);

  authService.initAuth();

  authService.onAuthStateChange((user) => {
    currentUser = user;

    if (!user) {
      workspaceService.stopListening();
      renderRoute(router.getCurrentRoute());
      return;
    }

    workspaceLoading = true;
    renderRoute(router.getCurrentRoute());

    workspaceService
      .initForUser(user.uid, user.displayName, () => {
        workspaceLoading = false;
        renderRoute(router.getCurrentRoute());
      })
      .catch((error) => {
        console.error('[main] Failed to load classrooms:', error);
        workspaceLoading = false;
        window.alert('We couldn\u2019t load your classrooms. Please check your connection and try again.');
        renderRoute(router.getCurrentRoute());
      });
  });
}

document.addEventListener('DOMContentLoaded', init);
