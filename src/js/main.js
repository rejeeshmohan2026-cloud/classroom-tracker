/**
 * main.js
 *
 * Application entry point. Initialises the Workspace, wires up the
 * router, and renders whichever view/screen the current route calls for
 * (Welcome, Home, Tracker, Settings, or the Setup Wizard). Creating a
 * classroom collects only its details (see ui/components/
 * NewClassroomModal.js) and immediately routes into the Setup Wizard —
 * importing students, buckets, groups, and scoring all happen there.
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

function renderRoute(route) {
  if (
    route.name === 'tracker' ||
    route.name === 'settings' ||
    route.name === 'setup' ||
    route.name === 'studentProfile'
  ) {
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
    } else {
      renderStudentProfileView(appContainer, {
        classroom,
        studentId: route.studentId,
        onBack: () => router.navigate(`/classroom/${classroom.id}`),
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
