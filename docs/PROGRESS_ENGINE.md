# Progress Engine

This document describes the Progress Engine — the computation layer behind Recognition, Leaderboards, Weekly/Monthly stats, and Pending Tasks. It's written so another developer can understand the system's behavior and guarantees **without reading the implementation**. Where useful, it names the actual function to look at, but every rule and edge case described here is meant to stand on its own.

---

## 1. Overall Architecture

### Where it lives

| File | Responsibility |
|---|---|
| `services/studentProgressService.js` | All derived metrics: stars, ranks, streaks, notebook completion, recognition, leaderboards. **Read-only.** |
| `services/pendingTaskService.js` | Runs a set of independent "what's outstanding" checkers against a classroom. **Read-only.** |
| `services/continueWorkingService.js` | The one write-capable piece — records a teacher's own recently-opened notebooks. Personal to the teacher, not shared with the classroom. |
| `config/recognitionCategories.js` | Data describing every recognition category (label, icon, achievement/progress kind, which periods it applies to, which internal calculation it dispatches to). No logic. |
| `config/pendingTaskTypes.js` | Data describing every pending-task type (id, label, icon). No logic — the matching checker function lives in `pendingTaskService.js`. |
| `utils/dateHelpers.js` | Pure date math: Monday-start week ranges, calendar month ranges, date-key comparison. No domain knowledge. |

### The one fact that makes all of this possible

`services/studentService.js`'s `resetAllScores()` (what "Reset Session" in Class Mode calls) **only zeroes the score cache** — it never touches `student.history`. Every star, deduction, badge, bucket change, and activity status is a permanent, append-only log entry with a timestamp. Likewise, `classroom.notebooks` (the day-by-day notebook register) is never pruned.

This means "this week's stars," "last month's rank," or "who won three weeks ago" are never separately stored anywhere — they are **always a date-range filter over data that already exists and never goes away.** There is no snapshot table, no nightly rollup job, no cache to keep in sync. A "new week" is just a new pair of date strings; nothing resets in storage.

### Data flow

```
Class Mode scoring, badges, buckets, activities  →  student.history (append-only)
Notebook Tracker checking                        →  classroom.notebooks (append-only)
                        │
                        ▼
              studentProgressService.js  (pure functions: data in, computed value out)
                        │
                        ▼
   Dashboard  │  Recognition Screen  │  Leaderboards  │  Reports  │  Student Profile
```

Nothing below `studentProgressService.js` in this diagram should ever query `student.history` or `classroom.notebooks` directly — everything goes through this one layer, so there is exactly one calculation engine for all of these numbers across the whole app.

### The read-only guarantee

Every function in `studentProgressService.js` and `pendingTaskService.js` takes a classroom (and sometimes other arguments) and returns a value. None of them ever call `workspaceService.save()`, mutate the classroom object, or touch Firestore. This is a hard invariant, not a style preference — anything that computes a number for Recognition, a Leaderboard, or a Report should be addable to `studentProgressService.js` without ever needing write access.

---

## 2. Public Function Reference

All functions below are exported from `services/studentProgressService.js` unless stated otherwise. `{ start, end }` is always a pair of `"YYYY-MM-DD"` strings, inclusive on both ends (see §3–4 for how these are produced).

### Per-notebook metrics (unbounded — a student's all-time relationship with one specific notebook)

| Function | Input | Output |
|---|---|---|
| `getCompletionPercent(classroom, subjectId, notebookTypeId, studentId)` | one notebook, one student | integer 0–100. `0` if the student has no entries at all for this notebook. |
| `getCurrentStreak(classroom, subjectId, notebookTypeId, studentId)` | one notebook, one student | integer ≥ 0 — consecutive `'complete'` entries ending on the most recent entry. Breaks on the first non-`'complete'` entry (including a gap). |
| `getBestStreak(classroom, subjectId, notebookTypeId, studentId)` | one notebook, one student | integer ≥ 0 — the longest such run anywhere in the student's history for this notebook. |
| `getLastChecked(classroom, subjectId, notebookTypeId, studentId)` | one notebook, one student | `"YYYY-MM-DD"` of the most recent entry, or `null` if never checked. |

### Period-bounded per-notebook / cross-notebook metrics (used by recognition/leaderboards)

| Function | Input | Output |
|---|---|---|
| `getBestActiveStreakAcrossNotebooksInRange(classroom, studentId, { start, end })` | one student, a date range | integer ≥ 0 — the best complete-in-a-row run **that occurred within that range**, across every configured notebook for the classroom. See §3–4 for why this differs from `getBestStreak`. |
| `getBestActiveStreakAcrossNotebooks(classroom, studentId)` | one student | integer ≥ 0 — this student's current active streak *right now*, the max of `getCurrentStreak()` across every configured notebook. Used for "how's this student doing right now" displays (e.g. Student Profile), not period-scoped recognition. |
| `getOverallNotebookCompletionInRange(classroom, studentId, { start, end })` | one student, a date range | integer 0–100, **or `null`** if the student has zero entries across every notebook within that range. The `null` case matters: it's what lets ranking functions exclude "no data" from "0% — tried and failed." |
| `getPerfectNotebookStudents(classroom, { start, end })` | a date range | array of `{ studentId, studentName, completionPercent: 100 }` — every student whose combined completion across every notebook, within range, was exactly 100%. Requires at least one entry to qualify (an empty range never counts as "perfect"). |

### Stars (points)

| Function | Input | Output |
|---|---|---|
| `getStarsInRange(classroom, studentId, { start, end })` | one student, a date range | integer ≥ 0 — sum of this student's *positive* point entries logged in range. Deductions are never subtracted (see §5's note on what "stars" means). |
| `getRankInRange(classroom, { start, end })` | a date range | array of `{ studentId, studentName, teamId, stars, rank }` for every student in the classroom, sorted by stars descending, ranked with ties (see §5). |
| `getTeamStarsInRange(classroom, teamId, { start, end })` | one team, a date range | integer ≥ 0 — sum of every student's stars on that team. |
| `getTeamRankInRange(classroom, { start, end })` | a date range | array of `{ teamId, teamName, stars, rank }` for every team, ranked with ties. |
| `getStreakRankInRange(classroom, { start, end })` | a date range | array of `{ studentId, studentName, teamId, streak, rank }`, ranked with ties, using `getBestActiveStreakAcrossNotebooksInRange`. |
| `getNotebookCompletionRankInRange(classroom, { start, end })` | a date range | array of `{ studentId, studentName, teamId, completionPercent, rank }` — students with `null` completion (no data in range) are **excluded from the array entirely**, not ranked at 0. |

### Biggest Climber

| Function | Input | Output |
|---|---|---|
| `getBiggestClimber(classroom, { currentRange, previousRange })` | two date ranges | array of `{ studentId, studentName, teamId, previousRank, currentRank, movement, stars }` — every student tied for the single largest positive rank movement, or `[]` if nobody actually climbed. See §6 for the full algorithm. |

### Recognition / Leaderboard dispatch (the intended entry point for Phases 2–3 and beyond)

| Function | Input | Output |
|---|---|---|
| `getLeaderboard(classroom, categoryId, period)` | a `config/recognitionCategories.js` id, and `'week'` \| `'month'` \| `'all_time'` | the full ranked list for that category/period (same shape as the matching function above). `[]` if the category doesn't exist or doesn't support that period. |
| `getRecognitionWinners(classroom, categoryId, period)` | same | array of whoever actually won — see §7. |

### Pending Tasks (`services/pendingTaskService.js`)

| Function | Input | Output |
|---|---|---|
| `getPendingTasks(classroom)` | a classroom | array of `{ id, label, icon, items: [...] }`, one entry per task type that found something outstanding. Task types with nothing pending are omitted entirely — see §9. |

### Continue Working (`services/continueWorkingService.js` — the exception to "read-only")

| Function | Input | Output |
|---|---|---|
| `recordRecentNotebook(uid, { classroomId, subjectId, notebookTypeId })` | a teacher's uid, which notebook they opened | nothing (fire-and-forget write) — see §10. |
| `subscribeToRecent(uid, onChange, onError)` | a teacher's uid, callbacks | an unsubscribe function; `onChange` receives the live list, most-recent-first, capped at 5. |

---

## 3. Weekly Calculation Rules

- A week is **Monday-start** (`utils/dateHelpers.js`'s `getMondayStartOfWeek`/`getWeekRange`), matching the product decision that "every Monday starts a new opportunity."
- `getWeekRange(dateKey)` returns `{ start, end }` for the Monday–Sunday week containing `dateKey` (defaults to today).
- `getPreviousWeekRange(dateKey)` returns the *immediately preceding* Monday–Sunday week — used as the comparison baseline for Biggest Climber.
- **Nothing resets in storage on Monday.** A "new week" is purely a new pair of date strings passed into the same functions listed in §2. Last week's numbers are always recoverable by asking for last week's range again — this is what "historical weeks remain available" means in practice.
- Date comparison is plain string comparison (`entry.dateKey >= start && entry.dateKey <= end`) — safe because `"YYYY-MM-DD"` sorts lexicographically the same as chronologically.

## 4. Monthly Calculation Rules

- A month is the plain calendar month (1st through the last day) containing the given date — `getMonthRange(dateKey)`.
- The "previous month" for Biggest Climber's monthly comparison is the previous *calendar* month (e.g. asking in August compares against all of July, not "the 30 days before today").
- Monthly figures are **not** a running accumulation of weekly figures kept in sync somewhere — they're computed by the exact same functions as weekly figures, just given a wider date range. This is why "monthly rankings continue accumulating" needed no special implementation: summing a bigger range naturally includes everything the smaller range already counted.

## 5. Tie Handling

Every ranking function (`getRankInRange`, `getTeamRankInRange`, `getStreakRankInRange`, `getNotebookCompletionRankInRange`) uses **standard competition ranking**: students tied on value share the same rank, and the next distinct value skips ranks accordingly.

```
Hari:  5 stars  → rank 1
Meena: 5 stars  → rank 1   (tied with Hari)
Arjun: 2 stars  → rank 3   (not rank 2 — the tie above "used up" rank 2)
```

This single rule is what makes "do not artificially break ties, celebrate co-winners" true throughout the system without any category needing its own tie-breaking logic — a recognition winner is simply "everyone at rank 1."

**Note on what "stars" means:** star totals only ever sum *positive* point entries (`kind === 'points' && delta > 0`). A deduction never reduces a star total — this mirrors the existing `getTotalPositivePoints()` used elsewhere in the app, and matches the project's established rule that ⭐ is always a positive-only metric.

## 6. Biggest Climber Algorithm

Biggest Climber measures **rank movement**, not raw star-total change — a student moving from 18th to 7th matters more than one whose star count merely went up, per the explicit product decision. Full algorithm, step by step (`getBiggestClimber`):

1. Compute `getRankInRange(classroom, currentRange)` — this period's star ranking for every student.
2. Compute `getRankInRange(classroom, previousRange)` — the immediately preceding period's star ranking.
3. For each student present in both:
   - `movement = previousRank − currentRank` (positive means they climbed; negative means they fell).
4. **Exclude a student entirely** if they have no history entry dated before `currentRange.start` — i.e., no evidence they were part of the classroom's tracked activity before this period began. This is a proxy, not a real enrollment-date check (the Student model has no join-date field) — a student's own earliest history entry is the closest available signal. Without this exclusion, a student who joined mid-period would show an artificial "climb" from an assumed baseline of zero stars, which isn't a genuine improvement.
   - **Important boundary detail:** this check compares against the *current* period's start, not the previous period's start. A student whose very first tracked activity happens to fall exactly on the previous period's first day is legitimate prior history, not a brand-new student — checking against the previous period's start would incorrectly exclude that case. (This was an actual bug caught during Phase 1 testing and corrected — see `CHANGELOG.md`.)
5. Keep only students with `movement > 0` — flat or falling students are never "biggest climbers," even if nobody else climbed either.
6. If no one is left, return `[]` — Biggest Climber has no winner this period rather than crowning whoever fell the least.
7. Otherwise, find the maximum `movement` among remaining students, and keep everyone tied at that maximum (co-winners, per §5).
8. If more than one student is still tied on movement, break the tie using **this period's star total** (higher wins) — the one documented exception to "never break ties," per the explicit product decision that raw stars serve as Biggest Climber's secondary tie-breaker specifically. If they're still tied after that, they remain co-winners.

## 7. Recognition Computation

A recognition category is pure configuration (`config/recognitionCategories.js`): an `id`, display `label`/`icon`, a `kind` (`'achievement'` or `'progress'` — purely a display grouping, no effect on computation), a list of `periods` it supports, and a `resolverId` that `getLeaderboard`/`getRecognitionWinners` use to pick which internal calculation to run:

| `resolverId` | Dispatches to |
|---|---|
| `stars` | `getRankInRange` |
| `streak` | `getStreakRankInRange` |
| `notebook_completion` | `getNotebookCompletionRankInRange` |
| `team_stars` | `getTeamRankInRange` |
| `biggest_climber` | `getBiggestClimber` (with both current and previous ranges resolved for the period) |

`getRecognitionWinners(classroom, categoryId, period)`:
- For `biggest_climber`: returns `getLeaderboard(...)` as-is — that function's result is already just the tied top climbers (or empty), so there's no separate "full list vs. winners" distinction for this category.
- For every other category: takes the full leaderboard and keeps only entries at `rank === 1`, **and** requires the winning value (stars, streak, or completion %) to be greater than zero. The zero-guard exists so a brand-new or completely inactive classroom doesn't crown a "Star Performer" who earned nothing.

Adding a new category later (Perfect Attendance, Best Reader, Teacher's Choice, ...) means adding one entry to `recognitionCategories.js` and, if its ranking logic doesn't already exist, one new function in `studentProgressService.js` plus one new `resolverId` case in the two dispatch functions — never a UI change.

## 8. Leaderboard Computation

`getLeaderboard(classroom, categoryId, period)` is the single function behind every leaderboard in the app — "switching leaderboards" is purely a matter of changing which `categoryId`/`period` gets passed in; there is exactly one code path underneath all of them.

The important distinction from Recognition: **a leaderboard always returns the complete list**, including students or teams at zero. This is deliberate — a teacher scanning a leaderboard for "who needs encouragement" needs to see everyone, not just the top. Only `getRecognitionWinners` (§7) applies the "must be non-zero" filter, and only to isolate an actual celebratory winner.

## 9. Pending Task Computation

`config/pendingTaskTypes.js` holds pure metadata (`id`, `label`, `icon`) for each task type; `pendingTaskService.js` holds one checker function per `id`, and `getPendingTasks(classroom)` runs every checker and returns only the task types that found something (empty groups are omitted, so a widget never has to render a "0 pending" state).

Current checkers, with their exact definitions (each a documented judgment call, since "pending" is inherently a little subjective):

- **`notebook_not_checked_today`** — a configured Subject × Notebook Type pair with zero register entries for today's date. Flags the *notebook*, not any individual student.
- **`activity_awaiting_completion`** — a Learning Activity with at least one student still at status `'Not Assigned'`, meaning the teacher hasn't finished marking the whole roster for it yet.
- **`homework_awaiting_review`** — a notebook entry within the last 7 days (inclusive of today) where a student's `submission` is `'submitted'` but `completion` is still `null`. Deliberately **not** restricted to notebook types literally named "Homework" — matching by display name would be fragile, since a classroom might call the same situation "Classwork" or anything else. The underlying situation ("submitted, not yet assessed") is what's being flagged, regardless of the notebook type's name.

Adding a new task type later means one new entry in `pendingTaskTypes.js` and one new checker function registered in `pendingTaskService.js`'s internal dispatch map — the widget consuming `getPendingTasks()` needs no changes.

## 10. Continue Working

Scoped to the **teacher**, not the classroom — two teachers on the same shared classroom each see their own recent list, never each other's. Implemented as a single array field (`recentNotebooks`) on the existing `users/{uid}` document (the same document already used for the one-time migration flag from an earlier phase) — no new Firestore collection.

`recordRecentNotebook(uid, entry)`:
- Wrapped in a Firestore transaction (read-modify-write), so two quick opens in a row — or two browser tabs — can't race and silently drop one.
- Removes any existing entry for the same `classroomId + subjectId + notebookTypeId` before prepending the new one, so reopening a notebook moves it back to the top rather than appearing twice.
- Caps the resulting list at 5 entries, most-recent-first.

As of Phase 1, this function is fully built and tested but **not called anywhere in the UI yet** — wiring it into the Register View is deferred to the phase that actually builds the Dashboard widget consuming it (see `CHANGELOG.md`).

---

## Performance Notes

*(Documentation only — nothing described here is implemented. The goal is to have this written down before it's needed, not to build it now.)*

### Expected computational complexity

Let **S** = number of students in a classroom, **N** = number of configured notebook types (across all subjects), and **D** = number of days/entries in a student's relevant history.

| Function | Complexity | Why |
|---|---|---|
| `getStarsInRange` | O(D) | Filters one student's full `history` array. |
| `getRankInRange` / `getTeamRankInRange` | O(S × D) | Calls `getStarsInRange` once per student, then an O(S log S) sort. |
| `getOverallNotebookCompletionInRange` | O(N × D) | Walks every configured notebook type for one student. |
| `getNotebookCompletionRankInRange` | O(S × N × D) | The above, once per student. |
| `getStreakRankInRange` | O(S × N × D) | Same shape as notebook completion ranking. |
| `getBiggestClimber` | O(S × D) | Two full `getRankInRange` calls (current + previous period), plus a linear scan for the "prior history" exclusion check. |
| `getRecognitionWinners` / `getLeaderboard` | Whatever the dispatched function costs | Adds no overhead of its own beyond the `switch`. |
| `getPendingTasks` | O(N × D) + O(activities × S) | Each checker is its own linear scan; they run independently, not compounded. |

None of this is asymptotically surprising — everything is a linear scan (or a small constant number of them) over data that's already in memory once a classroom is loaded. At real-world scale (a school year is a few hundred history entries per student, a handful of notebook types per classroom), every function above runs in comfortably sub-millisecond time.

### Potential bottlenecks

- **The Classroom Dashboard (Phase 2) will likely call several of these functions on every visit** — Recognition Wall, Weekly Snapshot, and Pending Tasks each need their own pass over the same underlying data. None of today's functions share intermediate results with each other (e.g. `getRankInRange` is recomputed independently by `getBiggestClimber`, by any leaderboard call, and by any recognition-winner call that happens to run in the same page load).
- **Multi-year history.** These are all linear in D (days/entries). A classroom used heavily for several years without ever archiving old data would see every one of these functions get proportionally slower, since there is currently no way to compute "this week's stars" without at least filtering the *entire* history array down to that week.
- **Notebook-completion and streak ranking are the most expensive today** (O(S × N × D)) — a classroom with many configured notebook types and a large roster is the scenario most likely to make these noticeably slower than the others first.

### Future caching opportunities (not implemented — for when classrooms grow much larger)

- **Per-classroom-per-period memoization within a single page load.** Several widgets on the same Dashboard render likely want the same `(classroom, categoryId, period)` result — a simple in-memory cache keyed on those three values, cleared whenever the classroom's data changes, would eliminate duplicate work within one visit without touching the read-only guarantee (the cache would live in the UI/view layer, not inside `studentProgressService.js` itself).
- **Indexing history by date.** `student.history` is currently a flat, unsorted-by-nothing-in-particular array; every range query does a full linear filter. If this ever becomes a bottleneck, a classroom-level index (e.g. a map from date-key to the list of history-entry references on that date, maintained alongside `history` rather than replacing it) would turn "give me everything in this date range" into a much cheaper lookup — at the cost of that index needing to be kept in sync wherever `history` is written.
- **Precomputed weekly/monthly rollups.** The most impactful option long-term, and the one most worth deferring deliberately: a background process that writes a small "week X totals" summary document per classroom once a week has ended (since past weeks never change once they're over). This would turn most of the O(S × D)-and-larger functions above into O(S) lookups for anything **not** in the current, still-changing period. This is explicitly **not** something `studentProgressService.js` itself should ever do — writing a rollup would break the read-only guarantee that makes this whole layer easy to reason about and safe to build on. If this is ever needed, it belongs in a separate, clearly-write-capable service, with `studentProgressService.js` preferring the rollup when one exists and falling back to today's live computation otherwise.
