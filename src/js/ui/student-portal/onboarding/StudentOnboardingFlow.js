/**
 * ui/student-portal/onboarding/StudentOnboardingFlow.js
 *
 * The single entry point main.js calls for the studentPortal route —
 * walks: already resolved? -> sign in -> link (PIN or invitation
 * token) -> pick a student (only if more than one is linked) -> done.
 * This is the ONLY file that sequences the three onboarding screens;
 * each screen itself only knows how to render its one step and report
 * back what happened, matching this app's established "views own
 * their content, a shell/orchestrator owns the flow" split (see
 * StudentPortalShell.js for the same separation on the section-nav
 * side).
 *
 * Supersedes the earlier classroom-code + localStorage placeholder
 * flow (StudentJoinCodeView.js / studentSessionService.js) — those
 * predate the finalized Google + PIN/invitation-link direction and are
 * no longer reachable from this route. See this project's CHANGELOG
 * for that earlier phase's own reasoning, which this supersedes.
 */

import * as studentIdentityService from '../../../services/studentIdentityService.js';
import { renderStudentSignInView } from './StudentSignInView.js';
import { renderStudentLinkView } from './StudentLinkView.js';
import { renderStudentPickerView } from './StudentPickerView.js';

export async function renderStudentOnboardingFlow(container, { invitationToken, onResolved }) {
  // An invitation token in the URL is always processed first, even if
  // this Google account is already linked to (and currently showing)
  // a different student — arriving via an invitation link is an
  // explicit action to link a student, most importantly the "parent
  // adding their second child" case the multi-student requirement is
  // specifically about. Falling through to the already-resolved fast
  // path first would silently ignore the token and just show
  // whichever student was already selected.
  const providerUserForToken = studentIdentityService.getCurrentProviderUser();
  if (invitationToken && providerUserForToken) {
    const linkedViaToken = await studentIdentityService.linkWithInvitationToken(invitationToken);
    if (linkedViaToken) {
      const linkedNow = await studentIdentityService.listLinkedStudents();
      if (linkedNow.length > 1) {
        renderStudentPickerView(container, { students: linkedNow, onSelected: onResolved });
      } else {
        onResolved(linkedViaToken);
      }
      return;
    }
    // Invalid/expired/already-used token — fall through to the normal
    // flow below (resolved fast path, or sign-in/PIN as needed) rather
    // than dead-ending here.
  }

  const resolved = await studentIdentityService.getCurrentStudent();
  if (resolved) {
    onResolved(resolved);
    return;
  }

  const providerUser = studentIdentityService.getCurrentProviderUser();
  if (!providerUser) {
    renderStudentSignInView(container, {
      onSignedIn: () => renderStudentOnboardingFlow(container, { invitationToken, onResolved }),
    });
    return;
  }

  const alreadyLinked = await studentIdentityService.listLinkedStudents();
  if (alreadyLinked.length > 0) {
    if (alreadyLinked.length === 1) {
      await studentIdentityService.selectStudent(alreadyLinked[0]);
      onResolved(alreadyLinked[0]);
      return;
    }
    renderStudentPickerView(container, {
      students: alreadyLinked,
      onSelected: onResolved,
    });
    return;
  }

  renderStudentLinkView(container, {
    invitationToken,
    onLinked: async (studentRef) => {
      const linkedNow = await studentIdentityService.listLinkedStudents();
      if (linkedNow.length > 1) {
        renderStudentPickerView(container, { students: linkedNow, onSelected: onResolved });
      } else {
        onResolved(studentRef);
      }
    },
  });
}
