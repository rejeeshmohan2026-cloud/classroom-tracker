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
