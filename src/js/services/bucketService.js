/**
 * services/bucketService.js
 *
 * Operations on Learning Buckets: assigning one to a student, bulk-
 * applying buckets detected during CSV import, and reading/updating a
 * classroom's bucket scoring (never hardcoded — see
 * config/classroomDefaults.js for the starting values, which every
 * classroom stores its own editable copy of in classroom.settings).
 */

import { BUCKET_KEYS } from '../config/bucketConfig.js';

export function assignBucket(student, bucket) {
  if (bucket !== null && !BUCKET_KEYS.includes(bucket)) {
    throw new Error(`Invalid bucket: ${bucket}`);
  }
  student.bucket = bucket;
}

/**
 * Applies a { studentName: bucketKey } map (e.g. detected from a CSV's
 * Bucket column) to every matching student across every team in the
 * classroom. Returns how many students actually got a bucket assigned,
 * so the caller can report it back to the teacher.
 */
export function applyBucketsToClassroom(classroom, bucketsByName) {
  let appliedCount = 0;
  classroom.teams.forEach((team) => {
    team.students.forEach((student) => {
      const bucket = bucketsByName[student.name];
      if (bucket && BUCKET_KEYS.includes(bucket)) {
        student.bucket = bucket;
        appliedCount += 1;
      }
    });
  });
  return appliedCount;
}

export function getBucketScoring(classroom) {
  return classroom.settings.bucketScoring;
}

export function updateBucketScoring(classroom, updates) {
  Object.assign(classroom.settings.bucketScoring, updates);
  return classroom.settings.bucketScoring;
}
