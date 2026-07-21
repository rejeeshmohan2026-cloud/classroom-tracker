/**
 * main.js
 *
 * Application entry point. Initialises the Workspace, wires up the
 * router, and renders whichever view the current route calls for
 * (Welcome, Home, Tracker, or Settings). The "+ New Classroom" flow
 * (modal -> import or manual create -> navigate to the new classroom) is
 * owned here since it's triggered from more than one view.
 */

import * as workspaceService from './services/workspaceService.js';
import { parseClassroomCsv, ClassroomImportError } from './services/classroomImportService.js';
import { ClassroomValidationError } from './services/classroomService.js';
import * as router from './ui/router.js';
import { renderWelcomeView } from './ui/views/WelcomeView.js';
import { renderHomeView } from './ui/views/HomeView.js';
import { renderTrackerView } from './ui/views/TrackerView.js';
import { renderSettingsView } from './ui/views/SettingsView.js';
import { openNewClassroomModal } from './ui/components/NewClassroomModal.js';

let appContainer = null;

function handleNewClassroom() {
  openNewClassroomModal({
    onImport: async (details, file, close) => {
      let teamsWithStudents;
      try {
        const csvText = await file.text();
        teamsWithStudents = parseClassroomCsv(csvText);
      } catch (error) {
        const message =
          error instanceof ClassroomImportError
            ? error.message
            : 'Something went wrong reading that file. Please check the CSV and try again.';
        window.alert(message);
        return;
      }
      try {
        const classroom = workspaceService.importClassroom(details, teamsWithStudents);
        close();
        router.navigate(`/classroom/${classroom.id}`);
      } catch (error) {
        const message =
          error instanceof ClassroomValidationError
            ? error.message
            : 'Something went wrong creating that classroom.';
        window.alert(message);
      }
    },
    onCreateManually: (details, close) => {
      try {
        const classroom = workspaceService.createClassroomManually(details);
        close();
        router.navigate(`/classroom/${classroom.id}`);
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
  if (route.name === 'tracker' || route.name === 'settings') {
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
      });
    } else {
      renderSettingsView(appContainer, {
        classroom,
        section: route.section,
        onBack: () => router.navigate(`/classroom/${classroom.id}`),
        onNavigateSection: (section) =>
          router.navigate(`/classroom/${classroom.id}/settings/${section}`),
        onDeleted: () => router.navigate('/'),
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
