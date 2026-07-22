/**
 * ui/components/ClassroomHeader.js
 *
 * A slot-based header, used at the top of the Classroom Dashboard.
 * Deliberately generic rather than coupled to any specific widget:
 *
 *   ClassroomHeader
 *   ├── Primary Action     — the single highest-frequency action
 *   ├── Secondary Content  — supporting, glanceable content
 *   └── Classroom Context  — classroom name/subtitle
 *
 * This phase fills Primary Action with the existing "Start Class Mode"
 * button (ui/components/ClassModeWidget.js) and Secondary Content with
 * the existing ContinueWorkingWidget — both *relocated* here from their
 * previous positions on the Dashboard, not duplicated. Neither slot
 * knows or cares what's inside it; each just accepts a pre-built DOM
 * element, so a future phase can put something else in either slot
 * without this file changing at all.
 */

export function createClassroomHeaderElement({ classroomContext, primaryAction, secondaryContent }) {
  const header = document.createElement('header');
  header.className = 'tracker-header classroom-header';

  const contextBlock = document.createElement('div');
  contextBlock.className = 'classroom-header__context';
  contextBlock.appendChild(classroomContext);
  header.appendChild(contextBlock);

  if (primaryAction) {
    const primaryBlock = document.createElement('div');
    primaryBlock.className = 'classroom-header__primary-action';
    primaryBlock.appendChild(primaryAction);
    header.appendChild(primaryBlock);
  }

  if (secondaryContent) {
    const secondaryBlock = document.createElement('div');
    secondaryBlock.className = 'classroom-header__secondary-content';
    secondaryBlock.appendChild(secondaryContent);
    header.appendChild(secondaryBlock);
  }

  return header;
}
