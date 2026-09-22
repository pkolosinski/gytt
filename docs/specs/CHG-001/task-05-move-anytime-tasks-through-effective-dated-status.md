# Task 5: Move Anytime tasks through effective-dated status

**Status:** pending

**Depends on:** Task 4

**Description:** Move an Anytime task in either direction among To do, In progress, and Completed by pointer or keyboard, preserve historical status, hide it after completion, and allow a later transition to reopen it. Add monotonic transition sequences, effective-date resolution, start-date validation, desired-state idempotency, revision/CAS writes, source-owned summary updates, and operation-specific unambiguous, ambiguous-timeout, read-back, and storage-outage tests. Add pointer movement, the equivalent keyboard Move action, visible focus, announcements, and affected-control-only mutation state.

**Acceptance Criteria:**

- Scenarios "Move an Anytime task in progress", "Complete an Anytime task on the viewed date", and "Reopen a completed Anytime task" pass.
- Scenario "Reject completion before an Anytime task starts" returns `422 INVALID_CALENDAR_OPERATION` without mutation.
- Scenarios "Keep completed Tasks visible" and "Move a Task without dragging" pass for standard Tasks.
- Repeating the same desired status on the same effective date is idempotent.
- A stale aggregate version returns `409 VERSION_CONFLICT` and never overwrites a newer transition.
- A dispatched status timeout returns success only after exact read-back; otherwise it returns `COMMIT_UNKNOWN`, and database outage never produces a success-shaped result.
