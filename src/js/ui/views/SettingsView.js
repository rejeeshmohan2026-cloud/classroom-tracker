/**
 * ui/views/SettingsView.js
 *
 * The per-classroom Settings screen: General, Students, Groups, Teachers,
 * Permissions, and Danger Zone, as tabs sharing one screen. Each section
 * calls straight into the relevant service (teamService, studentService,
 * memberService, workspaceService) and re-renders itself afterwards —
 * there's no separate state layer here, the classroom object passed in is
 * mutated directly and workspaceService.save() persists it.
 *
 * Permissions is a static reference table only: there's no
 * authentication yet, so nothing here is actually enforced (see
 * services/permissionService.js).
 */

import * as teamService from '../../services/teamService.js';
import * as studentService from '../../services/studentService.js';
import * as memberService from '../../services/memberService.js';
import * as workspaceService from '../../services/workspaceService.js';
import * as setupProgressService from '../../services/setupProgressService.js';
import { getDisplayName, ClassroomValidationError } from '../../services/classroomService.js';
import { MEMBER_ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../../config/memberRoles.js';

const SECTIONS = ['general', 'students', 'groups', 'teachers', 'permissions', 'danger'];
const SECTION_LABELS = {
  general: 'General',
  students: 'Students',
  groups: 'Groups',
  teachers: 'Teachers',
  permissions: 'Permissions',
  danger: 'Danger Zone',
};

export function renderSettingsView(container, { classroom, section, onBack, onNavigateSection, onDeleted, onReopenSetupWizard }) {
  container.innerHTML = '';
  const activeSection = SECTIONS.includes(section) ? section : 'general';
  const rerender = () =>
    renderSettingsView(container, {
      classroom,
      section: activeSection,
      onBack,
      onNavigateSection,
      onDeleted,
      onReopenSetupWizard,
    });

  const wrapper = document.createElement('div');
  wrapper.className = 'settings-view';

  const header = document.createElement('header');
  header.className = 'settings-header';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'btn btn--text';
  backButton.textContent = '← Back';
  backButton.addEventListener('click', onBack);

  const title = document.createElement('h1');
  title.className = 'settings-header__title';
  title.textContent = `${getDisplayName(classroom)} \u00b7 Settings`;

  header.append(backButton, title);

  const tabs = document.createElement('nav');
  tabs.className = 'settings-tabs';
  tabs.setAttribute('aria-label', 'Settings sections');

  SECTIONS.forEach((key) => {
    const tabButton = document.createElement('button');
    tabButton.type = 'button';
    tabButton.className =
      'settings-tabs__tab' + (key === activeSection ? ' settings-tabs__tab--active' : '');
    tabButton.textContent = SECTION_LABELS[key];
    tabButton.addEventListener('click', () => onNavigateSection(key));
    tabs.appendChild(tabButton);
  });

  const content = document.createElement('div');
  content.className = 'settings-content';

  const sectionRenderers = {
    general: (el, cls, rr) => renderGeneralSection(el, cls, rr, onReopenSetupWizard),
    students: renderStudentsSection,
    groups: renderGroupsSection,
    teachers: renderTeachersSection,
    permissions: renderPermissionsSection,
    danger: (el) => renderDangerSection(el, classroom, onDeleted),
  };
  sectionRenderers[activeSection](content, classroom, rerender);

  wrapper.append(header, tabs, content);
  container.appendChild(wrapper);
}

function renderGeneralSection(content, classroom, rerender, onReopenSetupWizard) {
  content.appendChild(renderSetupProgressBlock(classroom, onReopenSetupWizard));

  const section = document.createElement('div');
  section.className = 'settings-section';

  const schoolNameInput = createLabeledInput(section, {
    label: 'School Name',
    value: classroom.schoolName,
  });
  const gradeSectionInput = createLabeledInput(section, {
    label: 'Grade / Section',
    value: classroom.gradeSection,
  });
  const classroomNameInput = createLabeledInput(section, {
    label: 'Classroom Name (optional)',
    value: classroom.classroomName,
  });
  const academicYearInput = createLabeledInput(section, {
    label: 'Academic Year (optional)',
    value: classroom.academicYear,
  });
  const descriptionInput = createLabeledInput(section, {
    label: 'Description (optional)',
    value: classroom.description,
    multiline: true,
  });

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'btn btn--primary';
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', () => {
    try {
      workspaceService.updateClassroomDetails(classroom.id, {
        schoolName: schoolNameInput.value.trim(),
        gradeSection: gradeSectionInput.value.trim(),
        classroomName: classroomNameInput.value.trim(),
        academicYear: academicYearInput.value.trim(),
        description: descriptionInput.value.trim(),
      });
      rerender();
    } catch (error) {
      const message =
        error instanceof ClassroomValidationError
          ? error.message
          : 'Something went wrong saving these details.';
      window.alert(message);
    }
  });
  section.appendChild(saveButton);

  const createdAt = document.createElement('p');
  createdAt.className = 'settings-section__meta';
  createdAt.textContent = `Created ${new Date(classroom.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
  section.appendChild(createdAt);

  content.appendChild(section);
}

function createLabeledInput(section, { label, value, multiline = false }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'settings-section__label';
  wrapper.textContent = label;

  const input = document.createElement(multiline ? 'textarea' : 'input');
  if (!multiline) input.type = 'text';
  input.className = 'settings-section__input';
  input.value = value || '';
  if (multiline) input.rows = 3;

  wrapper.appendChild(input);
  section.appendChild(wrapper);
  return input;
}

function renderSetupProgressBlock(classroom, onReopenSetupWizard) {
  const block = document.createElement('div');
  block.className = 'settings-section settings-progress-block';

  const heading = document.createElement('h3');
  heading.className = 'settings-team-block__heading';
  heading.textContent = 'Setup Progress';
  block.appendChild(heading);

  const list = document.createElement('ul');
  list.className = 'wizard-checklist wizard-checklist--compact';

  const STATUS_ROWS = [
    { key: 'classroomDetails', label: 'Classroom Details' },
    { key: 'importStudents', label: 'Students Imported' },
    { key: 'assignBuckets', label: 'Buckets Assigned' },
    { key: 'customizeGroups', label: 'Groups Customized' },
    { key: 'configureScoring', label: 'Scoring Configured' },
  ];

  STATUS_ROWS.forEach(({ key, label }) => {
    list.appendChild(createStatusRow(label, setupProgressService.isStepDone(classroom, key)));
  });

  // Teacher Collaboration has no on/off state yet — it's Coming Soon
  // regardless, same as the wizard's Invite Teachers step.
  list.appendChild(createStatusRow('Teacher Collaboration (Coming Soon)', false));

  block.appendChild(list);

  const reopenButton = document.createElement('button');
  reopenButton.type = 'button';
  reopenButton.className = 'btn btn--ghost';
  reopenButton.textContent = 'Continue Setup';
  reopenButton.addEventListener('click', onReopenSetupWizard);
  block.appendChild(reopenButton);

  return block;
}

function createStatusRow(label, done) {
  const item = document.createElement('li');
  item.className = 'wizard-checklist__item';

  const row = document.createElement('div');
  row.className = 'wizard-checklist__row';

  const icon = document.createElement('span');
  icon.className = 'wizard-checklist__icon' + (done ? ' wizard-checklist__icon--done' : '');
  icon.textContent = done ? '\u2713' : '';
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className = 'wizard-checklist__label';
  text.textContent = label;

  row.append(icon, text);
  item.appendChild(row);
  return item;
}

function renderStudentsSection(content, classroom, rerender) {
  const section = document.createElement('div');
  section.className = 'settings-section';

  if (classroom.teams.length === 0) {
    const message = document.createElement('p');
    message.className = 'settings-section__meta';
    message.textContent = 'Add a group first, in the Groups tab, before adding students.';
    section.appendChild(message);
    content.appendChild(section);
    return;
  }

  classroom.teams.forEach((team) => {
    const teamBlock = document.createElement('div');
    teamBlock.className = 'settings-team-block';

    const heading = document.createElement('h3');
    heading.className = 'settings-team-block__heading';
    heading.textContent = team.name;
    teamBlock.appendChild(heading);

    const list = document.createElement('ul');
    list.className = 'settings-editable-list';

    team.students.forEach((student) => {
      const item = document.createElement('li');
      item.className = 'settings-editable-list__item';

      const input = document.createElement('input');
      input.type = 'text';
      input.value = student.name;
      input.addEventListener('change', () => {
        const newName = input.value.trim();
        if (!newName) {
          input.value = student.name;
          return;
        }
        studentService.renameStudent(team, student.id, newName);
        workspaceService.save();
      });

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'btn btn--text btn--danger-text';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        const confirmed = window.confirm(`Remove ${student.name} from ${team.name}?`);
        if (!confirmed) return;
        studentService.removeStudent(team, student.id);
        workspaceService.save();
        rerender();
      });

      item.append(input, removeButton);
      list.appendChild(item);
    });

    teamBlock.appendChild(list);
    teamBlock.appendChild(
      createAddForm('New student name', 'Add student', (name) => {
        studentService.addStudent(team, name);
        workspaceService.save();
        rerender();
      })
    );

    section.appendChild(teamBlock);
  });

  content.appendChild(section);
}

function renderGroupsSection(content, classroom, rerender) {
  const section = document.createElement('div');
  section.className = 'settings-section';

  const list = document.createElement('ul');
  list.className = 'settings-editable-list';

  classroom.teams.forEach((team) => {
    const item = document.createElement('li');
    item.className = 'settings-editable-list__item';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = team.name;
    input.addEventListener('change', () => {
      const newName = input.value.trim();
      if (!newName) {
        input.value = team.name;
        return;
      }
      teamService.renameTeam(classroom, team.id, newName);
      workspaceService.save();
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn btn--text btn--danger-text';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      const confirmed = window.confirm(
        `Remove ${team.name}? Its ${team.students.length} student(s) will be removed too.`
      );
      if (!confirmed) return;
      teamService.removeTeam(classroom, team.id);
      workspaceService.save();
      rerender();
    });

    item.append(input, removeButton);
    list.appendChild(item);
  });

  section.appendChild(list);
  section.appendChild(
    createAddForm('New group name', 'Add group', (name) => {
      teamService.addTeam(classroom, name);
      workspaceService.save();
      rerender();
    })
  );

  content.appendChild(section);
}

function renderTeachersSection(content, classroom, rerender) {
  const section = document.createElement('div');
  section.className = 'settings-section';

  const note = document.createElement('p');
  note.className = 'settings-section__meta';
  note.textContent =
    'Members are added by name only — there is no login yet, so this list is for your own record-keeping.';
  section.appendChild(note);

  const list = document.createElement('ul');
  list.className = 'settings-editable-list';

  memberService.listMembers(classroom).forEach((member) => {
    const item = document.createElement('li');
    item.className = 'settings-editable-list__item';

    const label = document.createElement('span');
    label.className = 'member-row__label';
    label.textContent = `${member.name} \u00b7 ${
      member.role === MEMBER_ROLES.ADMINISTRATOR ? 'Administrator' : 'Teacher'
    }`;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn btn--text btn--danger-text';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      const confirmed = window.confirm(`Remove ${member.name}?`);
      if (!confirmed) return;
      const removed = memberService.removeMember(classroom, member.id);
      if (!removed) {
        window.alert(
          'Every classroom needs at least one administrator — add another before removing this one.'
        );
        return;
      }
      workspaceService.save();
      rerender();
    });

    item.append(label, removeButton);
    list.appendChild(item);
  });

  section.appendChild(list);

  const addForm = document.createElement('div');
  addForm.className = 'settings-add-form';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Name';

  const roleSelect = document.createElement('select');
  [MEMBER_ROLES.TEACHER, MEMBER_ROLES.ADMINISTRATOR].forEach((role) => {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role === MEMBER_ROLES.ADMINISTRATOR ? 'Administrator' : 'Teacher';
    roleSelect.appendChild(option);
  });

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'btn btn--ghost';
  addButton.textContent = 'Add';
  addButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    memberService.addMember(classroom, name, roleSelect.value);
    workspaceService.save();
    rerender();
  });

  addForm.append(nameInput, roleSelect, addButton);
  section.appendChild(addForm);

  content.appendChild(section);
}

function renderPermissionsSection(content) {
  const section = document.createElement('div');
  section.className = 'settings-section';

  const note = document.createElement('p');
  note.className = 'settings-section__meta';
  note.textContent =
    'Reference only for now — there is no login yet, so none of this is enforced in the app.';
  section.appendChild(note);

  const table = document.createElement('table');
  table.className = 'permissions-table';

  const headRow = document.createElement('tr');
  ['Permission', 'Administrator', 'Teacher'].forEach((label) => {
    const th = document.createElement('th');
    th.textContent = label;
    headRow.appendChild(th);
  });
  table.appendChild(headRow);

  Object.values(PERMISSIONS).forEach((permission) => {
    const row = document.createElement('tr');

    const label = document.createElement('td');
    label.textContent = formatPermissionLabel(permission);
    row.appendChild(label);

    [MEMBER_ROLES.ADMINISTRATOR, MEMBER_ROLES.TEACHER].forEach((role) => {
      const cell = document.createElement('td');
      cell.textContent = ROLE_PERMISSIONS[role].includes(permission) ? '\u2713' : '\u2014';
      cell.className = 'permissions-table__cell';
      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  section.appendChild(table);
  content.appendChild(section);
}

function renderDangerSection(content, classroom, onDeleted) {
  const section = document.createElement('div');
  section.className = 'settings-section settings-section--danger';

  const warning = document.createElement('p');
  warning.className = 'settings-section__meta';
  warning.textContent = 'Deleting a classroom removes all its groups and students. This cannot be undone.';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'btn btn--danger';
  deleteButton.textContent = 'Delete classroom';
  deleteButton.addEventListener('click', () => {
    const confirmed = window.confirm(`Delete "${getDisplayName(classroom)}"? This cannot be undone.`);
    if (!confirmed) return;
    workspaceService.deleteClassroom(classroom.id);
    onDeleted();
  });

  section.append(warning, deleteButton);
  content.appendChild(section);
}

function createAddForm(placeholder, buttonLabel, onAdd) {
  const form = document.createElement('div');
  form.className = 'settings-add-form';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--ghost';
  button.textContent = buttonLabel;
  button.addEventListener('click', () => {
    const value = input.value.trim();
    if (!value) return;
    onAdd(value);
  });

  form.append(input, button);
  return form;
}

function formatPermissionLabel(permission) {
  return permission.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
