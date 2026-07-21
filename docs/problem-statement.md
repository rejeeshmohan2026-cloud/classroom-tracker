# Problem Statement

## Background

Fellows are responsible for tracking classroom performance, behavioural
observations, and student progress throughout the academic year. This
information currently lives across a mix of notebooks, spreadsheets, and
memory, which makes it difficult to:

> **Note on terminology:** throughout this project, a single logged
> occurrence — an academic update, a behavioural note, an attendance mark —
> is referred to as an **Event**. The app is built around an event-driven
> architecture: rather than overwriting a student's "current state," it
> records a timeline of Events and derives progress and trends from that
> log. See `README.md` for the architectural details.

- Spot patterns in a student's progress over time
- Recall context quickly during parent or stakeholder conversations
- Hand over accurate, organised records at the end of a Fellowship year
- Reflect on classroom-level trends across a term or year

## The Problem

Fellows need a simple, reliable way to record and revisit classroom
observations and student progress without depending on internet connectivity,
complex tools, or a steep learning curve.

## Who This Is For

- **Fellows**, who need a fast way to log observations during or after a
  school day
- **Program teams**, who may later want visibility into aggregated,
  anonymised classroom trends (out of scope for this milestone)

## Goals

- Provide a lightweight, offline-first tool that runs entirely in the
  browser
- Make it fast to record a classroom Event (low friction, minimal typing)
- Make it easy to review a student's history over time
- Keep the architecture simple and maintainable so the tool can grow
  incrementally, feature by feature

## Non-Goals (for now)

- No cloud sync or account system in this milestone
- No multi-device sync
- No reporting/analytics dashboards yet
- No collection of sensitive personal data (contact details, government ID
  numbers, health information, caste or religion data, or photos/videos of
  students) — see the Data Handling Note below

## Data Handling Note

This project only stores classroom performance data, behavioural
observations, and stakeholder names necessary for a Fellow's own
record-keeping. It must never be used to store contact details, government
identity numbers, health or medical information, caste or religion data, or
photos or videos of minors. Any requirement to handle this kind of data
should be escalated to the AI Working Committee before implementation.

## Success Looks Like

A Fellow can open the tool, quickly log an Event about a student or
classroom, and later come back to review that history — with the confidence
that the underlying architecture is clean enough to support new features
(search, filtering, exports, etc.) without requiring a rewrite.
