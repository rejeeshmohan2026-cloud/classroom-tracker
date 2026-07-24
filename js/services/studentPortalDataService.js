/**
 * services/studentPortalDataService.js
 *
 * The Student Portal's ONLY data source right now — every view in
 * ui/student-portal/ calls through here rather than reading Firestore
 * or hardcoding its own placeholder values. That's deliberate: this
 * file is a placeholder specifically so that swapping it for a real
 * data source later (once student authentication is actually
 * approved — see this project's CHANGELOG for why it isn't yet) means
 * changing this one file's implementation, not every view that
 * displays student data.
 *
 * "Reuse existing Firestore data wherever possible" (the stated data
 * philosophy) is already reflected in the *shape* of what's returned
 * here: these fields deliberately mirror what already exists on
 * models/Student.js and models/Classroom.js (name, score, bucket,
 * badges, team/group) rather than inventing a parallel shape — when
 * this does get wired to real data, it should be a thin read over the
 * same classroom document Classroom Tracker already uses, not a new
 * duplicated collection.
 *
 * Nothing here is tied to a real, authenticated student. This is
 * fixture data for building and reviewing the Portal's UI only.
 */

const PLACEHOLDER_STUDENT = {
  name: 'Kavisri',
  classroomName: 'Bloom Force 19',
  groupName: 'Group A',
  role: 'student',
};

export function getCurrentStudentProfile() {
  return { ...PLACEHOLDER_STUDENT };
}

export function getHomeSummary() {
  return {
    starsThisWeek: 6,
    teamName: PLACEHOLDER_STUDENT.groupName,
    teamRank: 1,
    recognitionCount: 2,
    latestRecognition: 'Star Performer',
    journeyStreak: 4,
    learningActivityInProgress: null, // Learning Hub doesn't exist yet
  };
}

export function getAchievements() {
  return [
    { id: 'star-performer', label: 'Star Performer', earnedOn: 'This week' },
    { id: 'learning-streak', label: 'Longest Learning Streak', earnedOn: 'This week' },
  ];
}

export function getTeamSummary() {
  return {
    teamName: PLACEHOLDER_STUDENT.groupName,
    teammates: ['Siddharth', 'Hareeksha', 'Vennish'],
    teamStars: 13,
  };
}
