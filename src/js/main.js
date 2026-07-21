/**
 * main.js
 *
 * Application entry point. Initialises the Workspace, wires up the
 * router, and renders whichever view/screen the current route calls for
 * (Welcome, Home, Tracker, Settings, Setup Wizard, Student Profile, or
 * Learning Activities).
 */

import * as workspaceService from './services/workspaceService.js';
import { ClassroomValidationError } from './services/classroomService.js';
import * as router from './ui/router.js';
import { renderWelcomeView } from './ui/views/WelcomeView.js';
import { renderHomeView } from './ui/views/HomeView.js';
import { renderTrackerView } from './ui/views/TrackerView.js';
import { renderSettingsView } from './ui/views/SettingsView.js';
import { renderSetupWizardView } from './ui/views/SetupWizardView.js';
import { renderStudentProfileView } from './ui/views/StudentProfileView.js';
import { renderActivitiesListView, renderActivityRosterView } from './ui/views/ActivitiesView.js';
import { openNewClassroomModal } from './ui/components/NewClassroomModal.js';

let appContainer = null;

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

function renderRoute(route) {
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
  workspaceService.init();
  router.onRouteChange(renderRoute);
  renderRoute(router.getCurrentRoute());
}

document.addEventListener('DOMContentLoaded', init);
