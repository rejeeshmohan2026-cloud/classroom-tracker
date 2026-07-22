# Changelog

All notable changes to Classroom Tracker are documented in this file, one entry per implementation phase.

---

## Phase 1 — Progress Engine & Foundation (Recognition/Dashboard groundwork)

**Scope:** computation and infrastructure only. No UI redesign, no new screens, no new navigation. Verified via full regression smoke test that existing functionality (classroom creation, Class Mode scoring, Settings, Notebook Tracker's Register/Timeline views, Student Profile) behaves identically to before this phase.

### Features Added
- **Weekly/monthly Progress Engine**: `studentProgressService` can now compute stars, ranks, streaks, and notebook completion scoped to a Monday-start week, a calendar month, or all-time — all derived from existing, permanent data (`student.history`, `classroom.notebooks`); nothing new is stored for this.
- **Recognition computation engine**: configuration-driven recognition categories (Star Performer, Longest Learning Streak, Notebook Champion, Team Champion, Biggest Climber) with automatic co-winner support — ties are never artificially broken.
- **Leaderboard computation**: one reusable ranked-list function per category, shared by recognition-winner lookup and full leaderboard display.
- **Biggest Climber**: rank-movement-based (not simple star-delta), with star total as a documented secondary tie-breaker, and exclusion of students with no tracked history before the comparison period.
- **Pending Tasks framework**: three initial checkers (notebook not checked today, activities awaiting completion, homework awaiting review), each independently extensible via config.
- **Continue Working infrastructure**: per-teacher (not classroom-shared) "recently opened notebooks" read/write path, capped at 5, most-recent-first. **Not yet wired to any UI call site** — see Breaking Changes/Deferred below.
- **Role & membership scaffolding**: `STUDENT` and `PARENT` added to `MEMBER_ROLES` as provider-agnostic placeholders (no permissions, no auth path). A reserved, unused `classroomJoinCode` field added to the Classroom model, documenting the future joining flow's plug-in point without implementing it.

### Files Created
- `src/js/config/recognitionCategories.js`
- `src/js/config/pendingTaskTypes.js`
- `src/js/services/pendingTaskService.js`
- `src/js/services/continueWorkingService.js`
- `CHANGELOG.md` (this file)
- `docs/PROGRESS_ENGINE.md` — architecture, full function reference, weekly/monthly rules, tie handling, the Biggest Climber algorithm, recognition/leaderboard/pending-task computation, and a Performance Notes section (complexity, bottlenecks, and documented-only future caching opportunities)

### Files Modified
- `src/js/services/studentProgressService.js` — major expansion (see Features Added); prior functions (`getCompletionPercent`, `getCurrentStreak`, `getBestStreak`, `getLastChecked`) unchanged.
- `src/js/config/memberRoles.js` — added `STUDENT`/`PARENT` roles with empty permission sets.
- `src/js/models/Classroom.js` — added reserved `classroomJoinCode` field (default `null`).
- `src/js/services/classroomService.js` — backfills `classroomJoinCode` for classrooms saved before this field existed.
- `src/js/utils/dateHelpers.js` — added `getMondayStartOfWeek`, `getWeekRange`, `getPreviousWeekRange`, `getMonthRange`, `isDateKeyInRange`.
- `src/js/repositories/classroomRepository.js` — added `recordRecentNotebook`/`subscribeToRecentNotebooks` to the interface.
- `src/js/repositories/firestoreClassroomRepository.js` — implemented the above two methods (transaction-guarded, capped-at-5 write to the existing `users/{uid}` document — no new collection).

### Breaking Changes
None. Every addition is new files or additive fields/functions; nothing existing was renamed or removed.

### Deferred (deliberately, within this phase)
- `continueWorkingService.recordRecentNotebook()` is fully built and tested but **not called from anywhere yet** — wiring it into `NotebookRegisterView.js` is deferred to Phase 2, since that's when the Dashboard widget that consumes this data exists. Calling it now would be an invisible-but-real new Firestore write triggered by using the app today, which this phase's "no behavior change" constraint was meant to avoid.

### New Services Introduced
- `pendingTaskService` (read-only)
- `continueWorkingService` (the one write-capable addition this phase — personal-to-teacher, not classroom-shared)

### New Configuration Files
- `recognitionCategories.js` — extensible recognition category registry
- `pendingTaskTypes.js` — extensible pending-task-type registry

### Architectural Decisions Made During Implementation
- **"Stars" = positive points only.** Deductions never count toward a star total, matching the app's existing "Total Positive Points" concept and its established visual-language rule that stars are always a positive-only metric.
- **Standard competition ranking** (ties share a rank; the next distinct value skips accordingly) used everywhere, so "celebrate co-winners, never artificially break ties" falls out of the ranking algorithm itself rather than needing special-case logic per category.
- **Leaderboards are always complete** (every student/team, including zero-value entries) for teacher browsing; **recognition winners additionally require a non-zero winning value**, so an empty or brand-new classroom doesn't crown a winner who earned nothing.
- **Longest Streak, when scoped to a week or month, means the longest complete-in-a-row run that occurred within that specific date range** (naturally capped at ~7 or ~31), not a student's all-time current streak — a different, period-bounded calculation from the existing Student-Profile-facing `getCurrentStreak`/`getBestStreak`, which remain unchanged and unbounded.
- **Biggest Climber's "did this student exist before now" check compares against the start of the *current* period, not the previous period.** (Corrected during implementation — an earlier draft compared against the previous period's start, which incorrectly excluded students whose earliest-ever activity happened to fall exactly on that boundary date. Caught by a test that deliberately used that exact edge case.)
- **Continue Working is scoped to `users/{uid}`, not the classroom document** — reusing the same per-account document already used for the migration flag, rather than introducing a new collection.
- **Pending Tasks' "homework awaiting review" is defined generically** (any notebook type, not just ones literally named "Homework") as "submitted but not yet assessed," since matching on a type's display name would be fragile.
- **`continueWorkingService.recordOpened()` renamed to `recordRecentNotebook()`** (post-Phase-1 review) — considered and rejected a broader `recordWorkspace()` name, since the function only ever accepts a notebook-shaped payload and Continue Working was explicitly scoped to notebooks in the approved brief. A generic name over a notebook-shaped payload would overstate current capability rather than future-proof it; the chosen name instead matches the repository method it wraps (`repository.recordRecentNotebook`) precisely. If Continue Working later broadens to other kinds of recent work, that's the point to design the richer shape and rename again — the same pattern already used once in this project (`notebookCheckService` → `notebookService`).

### Future TODOs
- Wire `continueWorkingService.recordRecentNotebook()` into `NotebookRegisterView.js` (Phase 2).
- Build the Classroom Dashboard consuming Recognition Wall / Weekly Snapshot / Continue Working / Pending Tasks (Phase 2).
- Build the dedicated Recognition screen and Leaderboard UI (Phase 3).
- Build the teacher-only Student Dashboard preview (Phase 4) — no authentication, no student accounts.
- Student/Parent onboarding (Class Code/QR joining, real authentication) remains blocked pending AI Working Committee review; `STUDENT`/`PARENT` roles and `classroomJoinCode` exist only as unused placeholders until then.

---

## Phase 2 — Classroom Dashboard

**Scope:** navigation, layout, and information architecture. No theming, no animation — explicitly deferred to Phase 5 per the phase plan. Verified via full regression testing (screenshots + Playwright) that every pre-existing screen (Notebook Tracker, Register View, Timeline View, Settings tabs, Class Mode scoring, deep-linking/page-reload) continues to work.

### Features Added
- **Classroom Dashboard**: the new default landing page at `/classroom/{id}`, replacing Class Mode as the first thing a teacher sees. Assembled entirely from independent, reusable widgets — no functionality duplicated from Notebook Tracker, Settings, or Class Mode.
- **Seven widgets**, each its own component: `RecognitionWidget`, `WeeklySnapshotWidget`, `ContinueWorkingWidget`, `PendingTasksWidget`, `SubjectsWidget`, `GroupsWidget`, `ClassModeWidget` — every one with a thoughtful, distinct empty state, verified on a brand-new classroom.
- **Class Mode relocated, not modified**: now reached via `/classroom/{id}/class-mode` through the Dashboard's "Start Class Mode" button. `TrackerView.js` itself has zero internal changes; only what routes into it and where its "Back" button returns to.
- **Continue Working's deferred Phase 1 wiring completed**: `continueWorkingService.recordRecentNotebook()` now has its first real call site, in `main.js`'s route dispatch for `notebookRegister` — firing on genuine navigation to a notebook, not on every internal re-render (e.g. marking a student). Verified end-to-end: opening a notebook and returning to the Dashboard shows it in Continue Working.
- **`getRecentNotebooksOnce()`** added to the repository/service layer — a one-time read, deliberately not a live subscription (see Architectural Decisions below).

### Files Created
- `src/js/ui/views/DashboardView.js`
- `src/js/ui/components/RecognitionWidget.js`
- `src/js/ui/components/WeeklySnapshotWidget.js`
- `src/js/ui/components/ContinueWorkingWidget.js`
- `src/js/ui/components/PendingTasksWidget.js`
- `src/js/ui/components/SubjectsWidget.js`
- `src/js/ui/components/GroupsWidget.js`
- `src/js/ui/components/ClassModeWidget.js`

### Files Modified
- `src/js/ui/router.js` — `/classroom/{id}` (bare) now resolves to `'dashboard'` instead of `'tracker'`; added `/classroom/{id}/class-mode` → `'tracker'`.
- `src/js/main.js` — added the `dashboard` route render branch; `tracker` route's `onBack` now returns to the Dashboard instead of Home; added the `recordRecentNotebook()` call site for the `notebookRegister` route.
- `src/js/repositories/classroomRepository.js` / `firestoreClassroomRepository.js` — added `getRecentNotebooksOnce(uid)` (one-time read, alongside the existing live `subscribeToRecentNotebooks`).
- `src/js/services/continueWorkingService.js` — added `getRecentOnce(uid)` wrapping the above.
- `src/css/styles.css` — minimal structural CSS for the new widgets (layout/spacing only, no visual polish, per this phase's explicit scope).

### Routing Changes
| Path | Before | After |
|---|---|---|
| `/classroom/{id}` | Class Mode (Tracker) | **Classroom Dashboard** |
| `/classroom/{id}/class-mode` | *(did not exist)* | Class Mode (Tracker) — unchanged internally |

Every other existing route (`settings`, `setup`, `student`, `activities`, `notebooks`, `notebooks/.../timeline`) is unchanged. Every `onBack`/`onFinish` callback that already pointed at bare `/classroom/{id}` now naturally lands on the Dashboard instead of Class Mode — no additional call sites needed updating beyond the one described above.

### Breaking Changes
None for end users — every existing screen and interaction is reachable and behaves identically to before. The one behavioral change is intentional and specified: the classroom's landing page is now the Dashboard instead of Class Mode.

### Architectural Decisions Made During Implementation
- **Subjects widget does not truly filter Notebook Tracker to one subject.** Clicking a subject navigates to the existing, unfiltered Notebook Tracker list (which already groups by subject). True filtering would require modifying `NotebookTrackerView.js`, which this phase's "existing modules remain their existing implementation" constraint argues against. Flagged for a decision rather than built silently — see the design-concerns note at the start of this phase's implementation.
- **Continue Working uses a one-time read, not a live subscription**, inside the Dashboard widget. This app has no view-unmount/cleanup mechanism — every prior live subscription lives at the `main.js`/app level, where a full-page re-render naturally supersedes the old one. A view-scoped subscription on `users/{uid}` (a document separate from the classroom, so the existing classroom listener can't cover it) would leak a listener on every Dashboard visit without a cleanup hook this app doesn't have yet. A one-time read was judged an honest, sufficient tradeoff for this feature's actual need ("what did I recently open, before this visit"), rather than introducing new lifecycle machinery to solve a problem this specific widget doesn't really have.
- **`recordRecentNotebook()` is called from `main.js`'s route dispatch, not from inside `NotebookRegisterView.js`'s render function.** The view's render function is also called internally (via its own `rerender()` closure) for actions like marking a student, which shouldn't re-trigger "recently opened" bookkeeping. Routing through `main.js` means the call fires only on genuine navigation to a notebook (including day-to-day navigation, which does route through `main.js`), not on every in-place UI update.
- **"Reports" is a disabled placeholder button, not a widget.** It has never been built in this app (only ever a planned nav item); this phase gives it the same "Coming Soon"-style treatment already established for the Teachers tab's invite button, rather than building a stub screen or a fake widget with no real data behind it.
- **Weekly Snapshot's "Weekly Stars" figure is a classroom-wide total** (sum across every student), distinct from the "Weekly Leaderboard" preview immediately below it (top 3 by individual rank, full tie inclusion). Read together, they answer "how much happened this week" and "who's leading" as two different questions rather than one being a subset view of the other.
- **Recognition Wall omits categories with no winner individually** rather than showing a "no winner" placeholder per category; the widget only shows one overall empty state if literally nothing has any winner yet. Matches "every widget should have a thoughtful empty state" as a single, whole-widget message rather than a repeated one.

### Future TODOs
- True per-subject filtering for the Subjects widget (currently opens the full Notebook Tracker list) — pending your decision on whether it's worth a small, scoped addition to `NotebookTrackerView.js`.
- Build the dedicated Recognition screen and Leaderboard UI (Phase 3).
- Build the teacher-only Student Dashboard preview (Phase 4) — no authentication, no student accounts.
- Student/Parent onboarding remains blocked pending AI Working Committee review.
- Visual/theme/animation polish for the Dashboard and its widgets — explicitly deferred to Phase 5.

---

## Phase 2 Refactor — Grouped Dashboard Hierarchy

**Context:** a design-first review (requested before this refactor, after Phase 2's initial implementation had already shipped) proposed grouping the Dashboard's flat widget list into two labeled sections — "Teaching" and "Classroom" — so the page more clearly answers four questions in order: what to celebrate, what needs attention, what to do next, and how the classroom is organized. Approved and implemented as a **structural refactor**, not a rebuild: every existing widget component is reused completely unchanged.

### What Changed
- `DashboardView.js`'s assembly logic: Recognition Wall and Weekly Snapshot remain ungrouped at the top (equal visual weight, both answering "what to celebrate"); Continue Working and Pending Tasks remain ungrouped immediately below (both answering "what needs attention"); Start Class Mode, Subjects, and a new Activities placeholder are now grouped under a "Teaching" heading; Groups, Reports, and Settings are now grouped under a "Classroom" heading.
- Start Class Mode is listed first within Teaching for visual priority, matching its status as the single most-performed daily action — using its existing, already-larger CTA styling rather than any new visual treatment.
- Reports and Settings moved from a standalone `actionsRow` into the new Classroom section (same buttons, same behavior, different container).
- Added an "Activities" placeholder (disabled, "Coming soon") inside Teaching — see Architectural Decisions below for why this doesn't conflict with the fact that Learning Activities already exists as a working feature elsewhere in the app.

### What Was Intentionally Left Unchanged
- **Every widget component file** (`RecognitionWidget.js`, `WeeklySnapshotWidget.js`, `ContinueWorkingWidget.js`, `PendingTasksWidget.js`, `SubjectsWidget.js`, `GroupsWidget.js`, `ClassModeWidget.js`) — zero code changes. The refactor only changed which container each one is appended to.
- **No renames.** `ClassModeWidget`/`GroupsWidget` were considered for a `...Card` rename to match an example tree, but rejected: renaming just these two would introduce a second naming convention alongside `RecognitionWidget`/`WeeklySnapshotWidget`/etc., reducing consistency rather than improving it. Per the explicit instruction to avoid cosmetic-only renames, they keep their existing names.
- **Routing** — unchanged from the original Phase 2 implementation (`/classroom/{id}` → Dashboard, `/classroom/{id}/class-mode` → Tracker). This refactor is a rendering/layout change only.
- **Responsiveness** — still single-column at every breakpoint, matching every other screen in this app. Multi-column layout experimentation is explicitly deferred to Phase 5.
- **Continue Working's one-time-read design** (vs. a live subscription) — unchanged; still the right call for the reasons documented in the original Phase 2 entry above.

### Files Created
- `src/js/ui/components/TeachingSection.js` — lightweight layout wrapper (heading + children), no data source or service of its own.
- `src/js/ui/components/ClassroomSection.js` — same pattern, for the Classroom grouping.

### Files Modified
- `src/js/ui/views/DashboardView.js` — restructured assembly logic (see "What Changed" above); added two small inline placeholder-button helpers (`createActivitiesPlaceholder`, `createReportsPlaceholder`) and a `createSettingsButton` helper, replacing the previous flat `actionsRow`.
- `src/css/styles.css` — removed the now-unused `.dashboard-view__actions-row`/`.dashboard-widget__actions-row` rule; added minimal structural CSS for `.dashboard-section`/`.dashboard-section__heading`/`.dashboard-section__group` (layout only — no color/theme changes).

### Regression Verification
Full Playwright pass confirmed: section headings render correctly grouping the intended children; Settings navigation from the Classroom section works; Subjects widget (now inside Teaching) still navigates to Notebook Tracker; Groups widget (now inside Classroom) still navigates to Settings › Groups; Start Class Mode still launches Class Mode unchanged; Back from Class Mode still returns to the Dashboard. Pending Tasks correctly reflected real state (a configured-but-unchecked notebook) against the refactored layout. **No functionality regressed** — confirmed by direct testing, not by inspection alone.

### Architectural Decisions Made During Implementation
- **TeachingSection/ClassroomSection are composition-only**, per instruction — no data fetching, no service imports, no empty state of their own (they can't be empty; they always have their fixed set of children).
- **The Activities placeholder does not conflict with the already-existing, fully-working Learning Activities feature** (reachable via Class Mode's header, unmodified). The placeholder is specifically about the *Dashboard* not yet having its own direct entry point to that feature — not about the feature being unbuilt. Flagging this explicitly since "Activities (future placeholder)" could otherwise read as a regression to someone who already uses Learning Activities today; it isn't one.
- **Reports and Settings render as full-width stacked buttons** within the Classroom section's single-column group, rather than the previous right-aligned row — a direct, minimal consequence of reusing the same `.dashboard-section__group` layout as every other section, not a deliberate visual decision (visual polish remains a Phase 5 concern).

### Future TODOs
(Unchanged from the original Phase 2 entry — this refactor didn't add or resolve any.)
