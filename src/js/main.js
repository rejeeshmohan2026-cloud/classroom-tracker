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
import * as classroomImportService from './services/classroomImportService.js';
import { ClassroomImportError } from './services/classroomImportService.js';
import { ClassroomValidationError } from './services/classroomService.js';
import * as router from './ui/router.js';
import { renderWelcomeView } from './ui/views/WelcomeView.js';
import { renderHomeView } from './ui/views/HomeView.js';
import { renderTrackerView } from './ui/views/TrackerView.js';
import { renderSettingsView } from './ui/views/SettingsView.js';
import { openNewClassroomModal } from './ui/components/NewClassroomModal.js';
import { openImportPreviewModal } from './ui/components/ImportPreviewModal.js';

let appContainer = null;

function handleNewClassroom() {
  openNewClassroomModal({
    onImport: async (details, file, closeNewClassroomModal) => {
      let analysis;
      try {
        const csvText = await file.text();
        analysis = classroomImportService.analyzeCsv(csvText);
      } catch (error) {
        window.alert('Something went wrong reading that file. Please check the CSV and try again.');
        return;
      }

      openImportPreviewModal({
        formats: analysis.formats,
        initialFormatId: analysis.detected.id,
        getPreview: (formatId) => {
          try {
            const teams = classroomImportService.parseWithFormat(formatId, analysis.rows);
            return { teams };
          } catch (error) {
            const message =
              error instanceof ClassroomImportError
                ? error.message
                : 'Could not parse this file with the selected format.';
            return { teams: [], error: message };
          }
        },
        onConfirm: (formatId) => {
          try {
            const teams = classroomImportService.parseWithFormat(formatId, analysis.rows);
            const classroom = workspaceService.importClassroom(details, teams);
            closeNewClassroomModal();
            router.navigate(`/classroom/${classroom.id}`);
          } catch (error) {
            const message =
              error instanceof ClassroomImportError || error instanceof ClassroomValidationError
                ? error.message
                : 'Something went wrong creating that classroom.';
            window.alert(message);
          }
        },
        onCancel: () => {
          // Leave the New Classroom modal open so the user can pick a
          // different file or switch to Create Manually.
        },
      });
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
