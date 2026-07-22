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

---

## Phase 3 — Recognition Experience

**Scope:** a dedicated Recognition Screen, two newly-extracted reusable components (`RecognitionCard`, `LeaderboardList`), and the routing/navigation connecting it to the Dashboard's existing Recognition Wall. Implemented in the approved order: extract `RecognitionCard` → extract `LeaderboardList` → build `RecognitionScreenView` → wire Dashboard "View All" → routing → regression testing → documentation. The Progress Engine (`studentProgressService.js`) was not modified at all this phase — every new screen and component consumes functions that already existed from Phase 1.

### Features Added
- **Recognition Screen** (`/classroom/{id}/recognition/{period?}/{categoryId?}`): period tabs (This Week / This Month / All Time), categories grouped by purpose (🏆 Performance, 📈 Growth, 🤝 Team, ⭐ Special Recognition), a full Winner Card for the selected category/period, and its leaderboard embedded directly below with in-place expand/collapse ("Show all" / "Show less" — no navigation, no separate page).
- **`RecognitionCard`**, extracted from a private function inside `RecognitionWidget.js` into its own reusable component with two variants: `compact` (Dashboard Wall — icon, label, names only) and `full` (Recognition Screen — adds reason, a prominently-formatted key statistic, and the period). Handles co-winners (never truncated) and a distinct Team Champion presentation (group icon + team name, not student initials).
- **`LeaderboardList`**, extracted as a fully generic, reusable ranked-list component — knows nothing about recognition categories, only renders whatever `entries`/`formatValue` it's given.
- **Recognition config extended**: `recognitionCategories.js` gained a `group` field (replacing the earlier, effectively-unused `kind`/`RECOGNITION_KINDS`), a `reasonText` per category (the Card's "Why?" answer), and a new `FUTURE_RECOGNITION_PLACEHOLDERS` list (Most Improved, Teacher's Choice, Most Helpful, Best Reader, Best Speaker, Creative Thinker, Perfect Attendance) rendered as visibly-disabled chips on the Recognition Screen — communicating "more is coming" without any computed data or fake resolver behind them.
- **Dashboard "View All"**: a small link in the Recognition Wall's header, navigating to the Recognition Screen at its default period/category.
- **Category/period auto-redirect**: selecting a period that the current category doesn't support (e.g. switching to "All Time" while viewing Biggest Climber, which only supports week/month) redirects to the first category that *does* support it, keeping the URL always valid and shareable rather than silently rendering a mismatched state.

### Files Created
- `src/js/ui/components/RecognitionCard.js`
- `src/js/ui/components/LeaderboardList.js`
- `src/js/ui/views/RecognitionScreenView.js`

### Files Modified
- `src/js/config/recognitionCategories.js` — `kind`/`RECOGNITION_KINDS` replaced with `group`/`RECOGNITION_GROUPS`/`RECOGNITION_GROUP_LABELS`/`RECOGNITION_GROUP_ORDER`; added `reasonText` per category; added `FUTURE_RECOGNITION_PLACEHOLDERS`.
- `src/js/ui/components/RecognitionWidget.js` — now consumes the shared `RecognitionCard` (compact variant) instead of its own private card-building function; added the "View All" link.
- `src/js/ui/views/DashboardView.js` — threads `onOpenRecognition` through to the Recognition widget.
- `src/js/ui/router.js` — added `/classroom/{id}/recognition/{period?}/{categoryId?}`.
- `src/js/main.js` — added `'recognition'` to the classroom route names; added the route dispatch branch; wired `onOpenRecognition` on the dashboard route.
- `src/css/styles.css` — replaced the old flat `.recognition-card` rules (compact-only) with variant-aware rules (`--compact`/`--full`), co-winner row layout, and new rules for the Recognition Screen's tabs/chips and the Leaderboard List.

### Routing Changes
| Path | Resolves to |
|---|---|
| `/classroom/{id}/recognition` | Recognition Screen, defaults to this week / first available category |
| `/classroom/{id}/recognition/{period}` | Recognition Screen, period selected, first available category for it |
| `/classroom/{id}/recognition/{period}/{categoryId}` | Both selected — deep-linkable and shareable |

No other existing route changed.

### Breaking Changes
None. `RECOGNITION_KINDS` was exported but never actually consumed anywhere in rendering logic (confirmed by grep before removing it) — its replacement by `group` has no observable effect on anything built in Phases 1–2.

### Regression Verification
Full Playwright pass confirmed: co-winner ties render correctly on both the Dashboard Wall and the Recognition Screen; all four group headings and all seven disabled placeholder chips render; the leaderboard's "Show all"/"Show less" toggle works in place with zero navigation; period-switching correctly auto-redirects away from a category that doesn't support the new period (Biggest Climber + All Time); empty states render correctly for a category with no winner. Separately, a full regression pass confirmed every Phase 1/2 feature (Settings, Notebook Tracker, Register View, Timeline View, Class Mode scoring, Dashboard's Teaching/Classroom sections) continues to work unchanged.

### Architectural Decisions Made During Implementation
- **The Progress Engine was not touched.** Every new screen/component consumes `getRecognitionWinners()`/`getLeaderboard()` exactly as Phase 1 built them — Phase 3 is purely a presentation-layer expansion, matching the explicit instruction to implement "using the existing Progress Engine without modifying its architecture."
- **`FUTURE_RECOGNITION_PLACEHOLDERS` is a separate list from `RECOGNITION_CATEGORIES`**, not the same array with a "disabled" flag — keeping real, computable categories and inert placeholders structurally distinct means `getRecognitionWinners()`/`getLeaderboard()` never need to special-case "a category with no resolver."
- **Formatting logic (key statistic strings, leaderboard value strings) lives in the UI layer** (`RecognitionCard.js`, `RecognitionScreenView.js`), not in config or the Progress Engine — `studentProgressService.js` returns plain structured data (numbers, names, ranks) only; every "5 Stars" / "12-Day Streak" / "+4 Rank Positions" string is assembled at render time from that data. This is also precisely what makes the future-certificate design goal achievable without engine changes.
- **`LeaderboardList` deliberately has zero knowledge of recognition categories** — it accepts entries and a `formatValue` function from its caller, so it's genuinely reusable (e.g. for a future dedicated Group Leaderboard) rather than reusable in name only.

### Future TODOs
- True per-subject filtering for the Subjects widget (carried over from Phase 2 — still unresolved).
- Build the teacher-only Student Dashboard preview (Phase 4) — no authentication, no student accounts.
- Printable certificate / Wall of Fame / assembly-announcement presentation of `RecognitionCard` — designed for, not built.
- Teacher's Choice, once implemented, needs its own explicitly write-capable service (e.g. `teacherChoiceService.js`), kept separate from the read-only Progress Engine — see the Phase 3 design discussion.
- Perfect Attendance needs an attendance data source before it can move from placeholder to computed category.
- Student/Parent onboarding remains blocked pending AI Working Committee review.
- Visual/theme/animation polish — explicitly deferred to Phase 5.

---

## Phase 4 — Teacher Productivity (Header Consolidation)

**Context:** a design-first review of teacher workflow friction concluded that the Dashboard's real gap wasn't missing features but redundant navigation for the two highest-frequency needs (starting Class Mode, resuming a recently-opened notebook) — both already existed and worked, just positioned mid-page behind celebratory content. Rather than adding a new "Quick Start" widget (my original proposal), a simpler approach was approved: **relocate** both into a slot-based header, with zero duplication.

### Features Added
- **`ClassroomHeader`**: a new, generic slot-based header component (`Primary Action` / `Secondary Content` / `Classroom Context`) — deliberately not coupled to any specific widget, so a future phase can change what fills either slot without touching this file.
- **Start Class Mode relocated** into the header's Primary Action slot — visible with zero scrolling the instant a teacher opens a classroom. Removed from the Teaching section (not duplicated).
- **Continue Working relocated** into the header's Secondary Content slot — same one-time-read loading pattern as before, just appending into a different container. Removed from its previous mid-page position (not duplicated).
- **Activities upgraded from a disabled placeholder to a real shortcut** into the existing, already-built Learning Activities feature (`ActivitiesView.js`) — the feature itself was never unbuilt; the Dashboard simply hadn't grown a direct link to it until now.
- **Pending Tasks made actionable**: each item is now clickable (via a new `onSelectTask` callback), deep-linking straight to the relevant Notebook Register View or Activity roster. No changes to `pendingTaskService.js` itself — every checker already returned everything a link needs (`subjectId`/`notebookTypeId`/`dateKey`, or `activityId`).

### Files Created
- `src/js/ui/components/ClassroomHeader.js`

### Files Modified
- `src/js/ui/views/DashboardView.js` — assembles the new header; removed `ClassModeWidget` from the Teaching section and the old `continueWorkingSlot` from mid-page content; Activities placeholder replaced with a real link; Pending Tasks now receives `onSelectPendingTask`.
- `src/js/ui/components/PendingTasksWidget.js` — items render as buttons (via the optional `onSelectTask` callback) rather than plain text when the callback is provided.
- `src/js/main.js` — added `onOpenActivities` and `onSelectPendingTask` to the dashboard route; the latter interprets each Pending Task item's shape (`activityId` vs. `subjectId`+`notebookTypeId`(+`dateKey`)) to build the correct navigation target.
- `src/css/styles.css` — structural CSS for the header's three slots and the clickable Pending Task links (layout only, no visual polish).

### Breaking Changes
None. Every relocation removes a widget from exactly one place and adds it to exactly one other — confirmed by direct testing that "Start Class Mode" and "Continue Working" each appear exactly once on the page, never zero, never two.

### Regression Verification
Full Playwright pass confirmed: header renders both slots correctly on a brand-new classroom; neither Start Class Mode nor Continue Working appears anywhere else on the page; the Activities link is genuinely enabled and navigates to the real Learning Activities list; a Pending Task for an unchecked notebook deep-links to its Register View (today, no explicit date needed) and disappears from the list once marked; a Pending Task for an activity awaiting completion deep-links to that activity's roster; Class Mode via the header still launches correctly and "Back" still returns to the Dashboard; the Recognition Screen remains reachable via "View All." Every Phase 1–3 capability continues to work.

### Architectural Decisions Made During Implementation
- **`ClassroomHeader` is intentionally generic**, per the explicit design refinement — it exposes three named slots and has no knowledge of what's inside them. This phase fills Primary Action and Secondary Content with existing, unmodified widgets; a future phase could put something else in either slot without any change to this component.
- **Notebook quick-open was explicitly not built.** Continue Working only covers notebooks opened recently; a specific, not-recently-opened notebook still requires the Subjects → Notebook Tracker path. Assessed as the lowest-frequency of the identified needs and deliberately deferred rather than added to the header, per the explicit decision to keep the header simplification narrow rather than reintroducing scope it was meant to avoid.
- **Recently Viewed Students was explicitly not built**, per the approved scope — remains a recommended future feature, intentionally kept independent from Continue Working rather than merged into a broader "recent work" concept (see the Phase 4 design discussion's trade-off analysis).
- **Award Stars was explicitly rejected as a Dashboard shortcut** — awarding a star outside Class Mode's existing Undo-stack-aware flow risks fragmenting the one coherent scoring model this app deliberately built; Class Mode continues to be the only way to award stars.
- **Pending Task navigation logic lives in `main.js`, not inside `PendingTasksWidget.js`** — consistent with this app's established pattern (e.g. the Notebook Register's `recordRecentNotebook` call site) of keeping routing decisions at the `main.js` dispatch boundary, with components themselves staying free of `router` imports.

### Future TODOs
- Notebook quick-open (a flat shortcut list of configured notebook types, skipping the Notebook Tracker list screen) — identified as a real but lower-priority gap; not scheduled.
- Recently Viewed Students — approved in principle as a future, independent widget following Continue Working's exact one-time-read pattern; not scheduled.
- Build the teacher-only Student Dashboard preview (Phase "Student Preview") — no authentication, no student accounts.
- Printable certificate / Wall of Fame / assembly-announcement presentation of `RecognitionCard` — designed for, not built.
- Teacher's Choice, once implemented, needs its own explicitly write-capable service, kept separate from the read-only Progress Engine.
- Perfect Attendance needs an attendance data source before it can move from placeholder to computed category.
- Student/Parent onboarding remains blocked pending AI Working Committee review.
- Visual/theme/animation polish — explicitly deferred.

---

## Phase 5 — Theme & Motion System

**Scope:** a unified design-token system (color, spacing, radius, elevation, typography, font-weight, motion) and a small, purpose-first motion layer, applied across the existing UI. No new features — every stage was verified to change nothing functionally except where a fix was explicitly warranted (see the accessibility contrast fixes below). Implemented in the approved reorder: **1. Design tokens → 2. Theme migration → 3. Component cleanup → 4. Accessibility pass → 5. Motion rollout**, testing after each stage.

### A correction made before Stage 1

The original design proposal invented arbitrary hex values for Success (`#2f9e5b`) and a Recognition-specific accent (`#c8952a`). Before writing any tokens, the project's actual TFI brand guide (`tfi-brand` skill) was checked — it already documents **TFI Lime Green (`#B7C930`)** as the brand's "secondary accent" and **TFI Orange (`#FF9629`)** as "warm accent, highlights." Both were used instead of the invented values — Success = Lime Green, Accent = Orange (per the approved rename from a Recognition-specific token to a general one). Warning (TFI Yellow) and Danger (TFI Red-Orange) were already brand-correct and unchanged.

### Features Added — Stage 1 (Design tokens)
Purely additive; verified via screenshot comparison that nothing rendered differently. Added to `:root`: semantic color aliases (`--color-primary`, `--color-primary-strong`, `--color-success`, `--color-warning`, `--color-accent`), a 7-step spacing scale (`--space-1` … `--space-7`), a pill radius token, a 5-level elevation scale (`--elevation-flat` → `--elevation-card` → `--elevation-hover` → `--elevation-sheet` → `--elevation-dialog`), a typography scale (`--text-xs` … `--text-2xl`), font-weight tokens (`--font-weight-regular/medium/bold/black`), and motion tokens (`--duration-instant/fast/base/celebratory`, one shared `--ease-standard`).

### Features Added — Stage 2 (Theme migration)
Every component-level reference to `--color-cyan`/`--color-cyan-dark`/`--shadow-card` migrated to the new semantic names (`--color-primary`/`--color-primary-strong`/`--elevation-card`). Pure rename — verified the computed color still resolves to the exact original TFI Cyan value (`rgb(14, 192, 226)`) after migration.

### Features Added — Stage 3 (Component cleanup)
- Every `font-weight` numeric value tokenized (600/700/800 all had exact token matches — zero visual change).
- Every hardcoded `border-radius: 999px` tokenized to `--radius-pill`.
- Recognition Cards given a distinct visual identity: a 3px top border in the new Accent color (TFI Orange) — the one genuinely new visual element in this stage, scoped narrowly to where it was designed to matter.
- The sixth and final button interaction state, **loading**, added (`[aria-busy="true"]`) — static appearance only at this stage (dimmed, a ring shown but not yet spinning), since the actual spin is motion and this stage was expressly the visual system, not motion.

### Features Added — Stage 4 (Accessibility pass)
- **A real WCAG AA contrast failure found and fixed**, not just documented: white text on TFI Cyan measures 2.17:1 — fails the 4.5:1 requirement for every text size in this app (none of the affected elements were large enough to qualify for the 3:1 "large text" exception, confirmed by checking each one's actual font-size). Fixed by changing text color to dark ink (8.0:1 contrast) everywhere this pairing occurred: the primary button (including "Start Class Mode," the single most-used button in the app), the Team Card header bar, the wizard checklist's done-icon, the user avatar's initial-letter fallback, active toggle-group buttons (Submission/Completion toggles, period tabs), the Notebook Register's "Today" badge, and the Recognition Screen's active category chip. **The brand color itself was never changed** — only the text color paired with it.
- `:focus-visible` extended to Phase 2–4's newer interactive elements that had been relying on browser-default outlines: dashboard chips, pending-task links, the leaderboard's expand/collapse toggle, and recognition category chips.
- The two separate, duplicated `@media (prefers-reduced-motion: reduce)` blocks identified in the original design review consolidated into one.
- `--color-muted` on `--color-bg`/`--color-surface` was checked (6.03:1 / 6.43:1) and already passes comfortably — no change needed there.

### Features Added — Stage 5 (Motion rollout)
- Every remaining hardcoded transition/animation duration and easing (`0.1s`/`0.15s`/`0.2s`/`0.22s`/`0.35s`, all bare `ease`) tokenized onto the Stage 1 motion scale.
- The button loading state's spinner animation completed (`@keyframes btn-spin`, 0.6s linear infinite — deliberately not one of the one-shot interaction durations, since a continuous loop needs different timing logic than a single state change).
- **Recognition card entrance animation**: fade + small upward lift (`translateY(8px)` → `0`), using the celebratory *duration* but the same standard easing as everything else — no overshoot, no bounce, per the explicit refinement to keep Recognition "extremely subtle."
- **Pending Task resolution**: success indication + height collapse, combined, as specified. A resolved item briefly reappears in lime-green with a checkmark, then collapses (max-height/opacity/padding all animating to zero) rather than vanishing abruptly. This required a small, explicitly-scoped exception to `PendingTasksWidget.js`'s otherwise-pure rendering: a module-level snapshot of the previous render's pending items, diffed against the current one purely to compute what just resolved — documented in-file as bookkeeping for one visual effect, not new application state.
- Hover-lift extended to dashboard chips (Subjects, Groups, Continue Working) — subtle `translateY(-1px)` + `--elevation-hover`, matching the existing `.classroom-card` pattern, scoped to `:not(:disabled)` only (a disabled chip should never imply clickability).
- "Motion communicates, never entertains" recorded directly in the stylesheet's motion-token comment block as the project's core motion principle, not just a design-conversation decision.

### Files Modified
- `src/css/styles.css` only — this entire phase was CSS plus one small, explicitly-scoped JS addition.
- `src/js/ui/components/PendingTasksWidget.js` — added the previous-render snapshot/diff mechanism for the resolution animation (see Stage 5 above).

### Breaking Changes
None. Stages 1–2 were verified to produce zero visual difference. Stages 3–5's visual changes (Recognition accent border, contrast fixes, new animations) are all deliberate, specified improvements, not incidental side effects.

### Regression Verification
A full Playwright pass after every stage, not just at the end: Stage 1 (screenshot parity), Stage 2 (computed-color parity — confirmed `rgb(14, 192, 226)` unchanged), Stage 3 (Recognition accent border renders as TFI Orange), Stage 4 (all contrast fixes confirmed rendering as dark ink; full Settings/Notebook/Class Mode/Recognition regression with zero page errors), Stage 5 (the Pending Task resolution flow tested end-to-end — check a notebook, return to Dashboard, confirm the lime-green success item appears then collapses to `max-height: 0`, confirm Pending Tasks then shows "You're all caught up"; Recognition card confirmed carrying the `recognition-card-in` animation). A final full regression pass (Settings, Notebook Tracker, Register/Timeline Views, Class Mode, Recognition Screen with period switching) confirmed zero errors.

### A mistake caught and fixed during implementation
While consolidating the two duplicated reduced-motion blocks (Stage 4), the merge accidentally deleted an unrelated mobile-responsive rule (`.notebook-checking-row`/`.notebook-timeline-row` layout at `max-width: 480px`) that had been sitting between the two blocks being merged. Caught immediately by checking for the rule's continued existence after the edit (not just trusting the diff), and restored in the same step before moving on. Documented here rather than left unmentioned, consistent with how the Phase 1 Biggest Climber bug was handled.

### Architectural Decisions Made During Implementation
- **Only one easing curve exists in the whole app, including for Recognition** — per the explicit refinement rejecting overshoot/bounce for celebratory moments. Celebration is distinguished by a longer *duration* only, never a different curve.
- **The elevation scale is five steps (Flat → Card → Hover → Sheet → Dialog), not the three originally proposed** — per the approved refinement, giving modals/sheets genuine visual separation from a merely-hovered card rather than sharing one shadow value across every "raised" element.
- **Font-weight tokens were added even though no dark theme exists yet** — because they were free (exact value matches, zero visual risk) and directly serve "future components automatically inherit them," independent of any theme question.
- **Icon system was explicitly out of scope**, per instruction — emoji stay as-is; a dedicated icon system is deferred to a future visual refresh, not bundled into this phase.
- **The Pending Task resolution animation's stateful diff was kept as narrow as possible** — a plain snapshot comparison, not a general change-detection framework, and explicitly documented as bookkeeping for one visual effect rather than a precedent for giving other otherwise-pure widgets memory between renders.

### Future TODOs
- Consider extending the Recognition accent-border treatment to other celebratory moments if/when they're added (e.g. a future Wall of Fame), per the rationale for renaming the token from Recognition-specific to general Accent.
- Dark theme remains a legitimate future option — this phase's semantic token layer is what makes it cheap to add later (swap token values only, touch no component CSS) — not scheduled now.
- A full pixel-level spacing migration (snapping every remaining ad hoc `padding` value onto the `--space-*` scale) was intentionally scoped narrower this phase (font-weight and radius only, both exact-value migrations) — a good candidate for a future, low-risk follow-up pass.
- (Carried over, unchanged from Phase 4's list): notebook quick-open, Recently Viewed Students, Student Dashboard preview, printable certificates, Teacher's Choice service, Perfect Attendance data source, Student/Parent onboarding.
