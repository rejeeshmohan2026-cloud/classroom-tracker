/**
 * config/recognitionCategories.js
 *
 * Every recognition category the app supports, as data — not hardcoded
 * into any screen. Adding a new category (Perfect Attendance, Best
 * Reader, Best English Speaker, Most Helpful, Creative Thinker,
 * Teacher's Choice, ...) means adding one entry here and, if it needs a
 * genuinely new ranking rule, one new function in
 * services/studentProgressService.js — never a UI rewrite. The
 * Recognition Wall and the dedicated Recognition screen (Phases 2 and 3)
 * both render whatever this list contains, in order.
 *
 * `kind` distinguishes achievement categories (already-there excellence)
 * from progress categories (rewarding growth) — see the "Achievement vs
 * Progress" product decision. This only affects how the Recognition Wall
 * groups categories visually; it has no effect on how a winner is
 * computed.
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
 */

export const RECOGNITION_KINDS = Object.freeze({
  ACHIEVEMENT: 'achievement',
  PROGRESS: 'progress',
});

export const RECOGNITION_PERIODS = Object.freeze(['week', 'month', 'all_time']);

export const RECOGNITION_CATEGORIES = Object.freeze([
  {
    id: 'star_performer',
    label: 'Star Performer',
    icon: '\u2b50', // ⭐
    kind: RECOGNITION_KINDS.ACHIEVEMENT,
    periods: ['week', 'month', 'all_time'],
    resolverId: 'stars',
  },
  {
    id: 'longest_streak',
    label: 'Longest Learning Streak',
    icon: '\ud83d\udd25', // 🔥
    kind: RECOGNITION_KINDS.ACHIEVEMENT,
    periods: ['week', 'month', 'all_time'],
    resolverId: 'streak',
  },
  {
    id: 'notebook_champion',
    label: 'Notebook Champion',
    icon: '\ud83d\udcd2', // 📒
    kind: RECOGNITION_KINDS.ACHIEVEMENT,
    periods: ['week', 'month', 'all_time'],
    resolverId: 'notebook_completion',
  },
  {
    id: 'team_champion',
    label: 'Team Champion',
    icon: '\ud83e\udd1d', // 🤝
    kind: RECOGNITION_KINDS.ACHIEVEMENT,
    periods: ['week', 'month', 'all_time'],
    resolverId: 'team_stars',
  },
  {
    id: 'biggest_climber',
    label: 'Biggest Climber',
    icon: '\ud83d\udcc8', // 📈
    kind: RECOGNITION_KINDS.PROGRESS,
    periods: ['week', 'month'],
    resolverId: 'biggest_climber',
  },
  // Reserved for later — each just needs a new resolverId + matching
  // function in studentProgressService.js once its data source exists
  // (e.g. attendance) or its definition is decided (e.g. Teacher's
  // Choice, which is a teacher pick rather than a computed metric).
  // Left out of RECOGNITION_CATEGORIES entirely, rather than included
  // with a stub resolver, so the Recognition Wall/Screen never has to
  // special-case "categories with no real winner yet":
  //   perfect_attendance, best_reader, best_english_speaker,
  //   most_helpful, creative_thinker, teachers_choice
]);

export function getRecognitionCategoryById(categoryId) {
  return RECOGNITION_CATEGORIES.find((category) => category.id === categoryId) || null;
}

export function listRecognitionCategoriesForPeriod(period) {
  return RECOGNITION_CATEGORIES.filter((category) => category.periods.includes(period));
}
