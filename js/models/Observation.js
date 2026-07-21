/**
 * models/Observation.js
 *
 * Describes the shape of a behavioural/performance Observation record —
 * a single note logged against a student or classroom at a point in time.
 * Models contain no business logic — they exist purely to document and
 * validate the data structures used across the app.
 *
 * Not implemented yet. Expected shape (subject to change):
 *   {
 *     id: string,          // unique identifier (see utils/idGenerator.js)
 *     studentId: string,   // reference to a Student record
 *     classroomId: string, // reference to a Classroom record
 *     note: string,        // free-text observation
 *     category: string,    // e.g. "academic", "behavioural", "attendance"
 *     recordedAt: string,  // ISO date string
 *   }
 *
 * Reminder: observation notes must never include contact details,
 * government identity numbers, health/medical information, or caste or
 * religion data — see docs/problem-statement.md.
 */

// Intentionally left unimplemented for this milestone.
