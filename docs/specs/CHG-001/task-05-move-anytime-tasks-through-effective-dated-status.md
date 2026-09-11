# Task 5: Move Anytime tasks through effective-dated status

**Status:** in progress

**Depends on:** Task 4

**Description:** Deliver the status-movement UI first with mock task states: mouse drag-and-drop, the keyboard- and touch-accessible Move action in Task details, visible focus, announcements, and affected-control-only pending state, followed by UI acceptance. Board cards do not show a status control. Then add the status mutation OpenAPI contract and generated client and connect the accepted controls to it. Implement effective-dated policy, revision/CAS persistence, the status route, and ambiguity/outage handling last. Do not implement or update Dashboard summary behavior here; populated Dashboard summaries belong to Task 17.

Implementation subtasks:

1. [x] Build pointer movement and affected-control-only pending/refresh states with mock data. Cards are dragged with a mouse only, so touch scrolling of the board is never hijacked.
2. [x] Build the keyboard- and touch-accessible Move action with mock data, visible focus, and status announcements. Only Task details shows the status menu; board cards have no status control.
3. [ ] Add component tests for mouse drag and details-menu movement, completion, reopening, and rollback; obtain UI acceptance before defining the API contract. Component tests for details-menu moves, completion visibility, reopening, rollback, and mouse drag are done; UI acceptance remains.
4. [ ] Define and verify the status mutation OpenAPI contract and regenerate the TypeScript client.
5. [ ] Connect the accepted pointer and keyboard controls to the generated client contract.
6. [ ] Add monotonic Task transition sequences and effective-date policy tests for forward, backward, same-date, completion, and reopening transitions.
7. [ ] Add start-date validation and prove a pre-start transition returns `INVALID_CALENDAR_OPERATION` without changing the aggregate.
8. [ ] Add desired-state idempotency and revision rules, proving repeated same-date status succeeds and stale versions cannot overwrite newer transitions.
9. [ ] Implement CAS-guarded status persistence and operation-specific tests for unambiguous failure, outage, dispatched timeout, exact read-back, and `COMMIT_UNKNOWN`.
10. [ ] Add the status mutation route with focused success, validation, conflict, and storage-error tests.
11. [ ] Add end-to-end regressions proving persisted status transitions satisfy the accepted UI contract.

**Acceptance Criteria:**

- Scenarios "Move an Anytime task in progress", "Complete an Anytime task on the viewed date", and "Reopen a completed Anytime task" pass.
- Scenario "Reject completion before an Anytime task starts" returns `422 INVALID_CALENDAR_OPERATION` without mutation.
- Scenarios "Keep completed Tasks visible" and "Move a Task from its details dialog" pass for standard Tasks.
- Repeating the same desired status on the same effective date is idempotent.
- A stale aggregate version returns `409 VERSION_CONFLICT` and never overwrites a newer transition.
- A dispatched status timeout returns success only after exact read-back; otherwise it returns `COMMIT_UNKNOWN`, and database outage never produces a success-shaped result.
- The status UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
- Dashboard summary behavior remains owned by Task 17.
