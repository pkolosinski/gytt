# Task 5: Move Anytime tasks through effective-dated status

**Status:** pending

**Depends on:** Task 4

**Description:** Move an Anytime task in either direction among To do, In progress, and Completed by pointer or keyboard, preserve historical status, hide it after completion, and allow a later transition to reopen it. Add monotonic transition sequences, effective-date resolution, start-date validation, desired-state idempotency, revision/CAS writes, source-owned summary updates, and operation-specific unambiguous, ambiguous-timeout, read-back, and storage-outage tests. Add pointer movement, the equivalent keyboard Move action, visible focus, announcements, and affected-control-only mutation state.

Implementation subtasks:

1. [ ] Add monotonic Task transition sequences and effective-date status resolution tests for forward, backward, same-date, completion, and reopening transitions.
2. [ ] Add start-date validation and prove a pre-start transition returns `INVALID_CALENDAR_OPERATION` without changing the aggregate.
3. [ ] Add desired-state idempotency and revision checks, proving a repeated same-date status succeeds and a stale version cannot overwrite a newer transition.
4. [ ] Implement the CAS-guarded status persistence path and update Tasks summary reads for completed and remaining standard Tasks.
5. [ ] Add operation-specific persistence tests for unambiguous failure, database outage, dispatched timeout, exact postcondition read-back, and `COMMIT_UNKNOWN`.
6. [ ] Add the status mutation route and OpenAPI/client mappings with focused success, validation, conflict, and storage-error tests.
7. [ ] Implement pointer movement for standard Task cards with affected-control-only pending state and board refresh.
8. [ ] Implement the equivalent keyboard Move action with visible focus and status announcements.
9. [ ] Add component tests for moving to In progress, completing on the viewed date, retaining completed cards, reopening later, and moving without dragging.

**Acceptance Criteria:**

- Scenarios "Move an Anytime task in progress", "Complete an Anytime task on the viewed date", and "Reopen a completed Anytime task" pass.
- Scenario "Reject completion before an Anytime task starts" returns `422 INVALID_CALENDAR_OPERATION` without mutation.
- Scenarios "Keep completed Tasks visible" and "Move a Task without dragging" pass for standard Tasks.
- Repeating the same desired status on the same effective date is idempotent.
- A stale aggregate version returns `409 VERSION_CONFLICT` and never overwrites a newer transition.
- A dispatched status timeout returns success only after exact read-back; otherwise it returns `COMMIT_UNKNOWN`, and database outage never produces a success-shaped result.
