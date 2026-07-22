/**
 * config/recognitionCategories.js
 *
 * Every recognition category the app supports, as data — not hardcoded
 * into any screen. Adding a new category means adding one entry here
 * and, if it needs a genuinely new ranking rule, one new function in
 * services/studentProgressService.js — never a UI rewrite. The
 * Recognition Wall (Dashboard) and the dedicated Recognition Screen
 * (Phase 3) both render whatever this list contains.
 *
 * `group` organizes categories the way a teacher naturally thinks about
 * them — Performance (already-there excellence), Growth (rewarding
 * improvement), Team (collective effort), and Special Recognition
 * (editorial/future). This only affects visual grouping; it has no
 * effect on how a winner is computed.
 *
 * `reasonText` is the short "why" shown on a Recognition Card ("Who? /
 * Why? / How much? / When?") — plain, human-readable, independent of
 * whatever the computed metric happens to be.
 *
 * `periods` lists which time windows a category makes sense for. Streak
 * and notebook-completion categories are meaningful "all time" as well
 * as weekly; Biggest Climber only makes sense week-over-week or
 * month-over-month, since it's a comparison between two periods.
 *
 * `resolverId` is looked up by services/studentProgressService.js's
 * getRecognitionWinners()/getLeaderboard() — it is NOT a function
 * reference, deliberately, so this file stays plain data with no
 * dependency on the services layer.
 *
 * FUTURE_RECOGNITION_PLACEHOLDERS (below) are deliberately NOT part of
 * RECOGNITION_CATEGORIES — they have no resolverId and nothing computes
 * a winner for them yet (Teacher's Choice is an editorial pick, not a
 * derived metric — see docs/PROGRESS_ENGINE.md's note on why that must
 * never become part of this read-only engine; Perfect Attendance has no
 * data source until attendance tracking exists; Most Improved,
 * Most Helpful, Best Reader, Best Speaker, and Creative Thinker are
 * simply not yet defined). The Recognition Screen renders these as
 * visibly-disabled chips (mainly within Special Recognition, plus one
 * under Growth) so the UI itself communicates "more is coming" without
 * the Progress Engine ever having to special-case a fake winner.
 */

export const RECOGNITION_GROUPS = Object.freeze({
  PERFORMANCE: 'performance',
  GROWTH: 'growth',
  TEAM: 'team',
  SPECIAL: 'special',
});

export const RECOGNITION_GROUP_LABELS = Object.freeze({
  [RECOGNITION_GROUPS.PERFORMANCE]: '\ud83c\udfc6 Performance',
  [RECOGNITION_GROUPS.GROWTH]: '\ud83d\udcc8 Growth',
  [RECOGNITION_GROUPS.TEAM]: '\ud83e\udd1d Team',
  [RECOGNITION_GROUPS.SPECIAL]: '\u2b50 Special Recognition',
});

// Preserves the order groups should render in — Object key order isn't
// guaranteed to matter to every consumer, so this is explicit.
export const RECOGNITION_GROUP_ORDER = Object.freeze([
  RECOGNITION_GROUPS.PERFORMANCE,
  RECOGNITION_GROUPS.GROWTH,
  RECOGNITION_GROUPS.TEAM,
  RECOGNITION_GROUPS.SPECIAL,
]);

export const RECOGNITION_PERIODS = Object.freeze(['week', 'month', 'all_time']);

export const RECOGNITION_CATEGORIES = Object.freeze([
  {
    id: 'star_performer',
    label: 'Star Performer',
    icon: '\u2b50', // ⭐
    group: RECOGNITION_GROUPS.PERFORMANCE,
    reasonText: 'Earned the most stars',
    periods: ['week', 'month', 'all_time'],
    resolverId: 'stars',
  },
  {
    id: 'longest_streak',
    label: 'Longest Learning Streak',
    icon: '\ud83d\udd25', // 🔥
    group: RECOGNITION_GROUPS.PERFORMANCE,
    reasonText: 'Longest run of complete notebooks in a row',
    periods: ['week', 'month', 'all_time'],
    resolverId: 'streak',
  },
  {
    id: 'notebook_champion',
    label: 'Notebook Champion',
    icon: '\ud83d\udcd2', // 📒
    group: RECOGNITION_GROUPS.PERFORMANCE,
    reasonText: 'Highest notebook completion',
    periods: ['week', 'month', 'all_time'],
    resolverId: 'notebook_completion',
  },
  {
    id: 'biggest_climber',
    label: 'Biggest Climber',
    icon: '\ud83d\udcc8', // 📈
    group: RECOGNITION_GROUPS.GROWTH,
    reasonText: 'Climbed the most positions in rank',
    periods: ['week', 'month'],
    resolverId: 'biggest_climber',
  },
  {
    id: 'team_champion',
    label: 'Team Champion',
    icon: '\ud83e\udd1d', // 🤝
    group: RECOGNITION_GROUPS.TEAM,
    reasonText: 'Highest team star total',
    periods: ['week', 'month', 'all_time'],
    resolverId: 'team_stars',
  },
]);

/**
 * Disabled-placeholder categories — see the file header for why these
 * are deliberately excluded from RECOGNITION_CATEGORIES rather than
 * given a stub resolver.
 */
export const FUTURE_RECOGNITION_PLACEHOLDERS = Object.freeze([
  { id: 'most_improved', label: 'Most Improved', icon: '\ud83c\udf31', group: RECOGNITION_GROUPS.GROWTH },
  { id: 'teachers_choice', label: "Teacher's Choice", icon: '\ud83c\udfc5', group: RECOGNITION_GROUPS.SPECIAL },
  { id: 'most_helpful', label: 'Most Helpful', icon: '\ud83e\udd17', group: RECOGNITION_GROUPS.SPECIAL },
  { id: 'best_reader', label: 'Best Reader', icon: '\ud83d\udcd6', group: RECOGNITION_GROUPS.SPECIAL },
  { id: 'best_speaker', label: 'Best Speaker', icon: '\ud83d\udde3', group: RECOGNITION_GROUPS.SPECIAL },
  { id: 'creative_thinker', label: 'Creative Thinker', icon: '\ud83c\udfa8', group: RECOGNITION_GROUPS.SPECIAL },
  { id: 'perfect_attendance', label: 'Perfect Attendance', icon: '\ud83c\udfaf', group: RECOGNITION_GROUPS.SPECIAL },
]);

export function getRecognitionCategoryById(categoryId) {
  return RECOGNITION_CATEGORIES.find((category) => category.id === categoryId) || null;
}

export function listRecognitionCategoriesForPeriod(period) {
  return RECOGNITION_CATEGORIES.filter((category) => category.periods.includes(period));
}
