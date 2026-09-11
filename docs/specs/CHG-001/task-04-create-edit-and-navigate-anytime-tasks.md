# Task 4: Create, edit, and navigate Anytime tasks

**Status:** pending

**Depends on:** Task 3

**Description:** Open Tasks on device Today, navigate exact LocalDates, preserve the three-column empty structure, create an Anytime task with a default or future start, edit its fields, read it directly by ID for conflict recovery, and carry it through its active interval. The board request composes the Tasks result with the public Habits due-day query behind the bounded composition-revision fence and fails as one unit. Add canonical caller-ID validation, deterministic document keys, aggregate revisions, To do initialization, Anytime visibility policy, update constraints, `TaskRecordView`, source-owned summary updates, and parameterized board adapter. Establish the common bounded mutation executor and operation-specific ambiguity/outage tests with this first real mutation. Implement the board coordinator that reads the initial composition revision around both capability queries and retries as specified. Add body limits, safe errors, shared storage/indeterminate-result UI, the OpenAPI create/update/by-ID/composite-read contract, and generated client. Build the date routes, navigation, stable empty board, unified modal shell, discriminated Anytime editor, and literal-text rendering tests. Apply Origin validation before mutation body processing and exact postcondition read-back after ambiguous durable writes.

Implementation subtasks:

1. [ ] Define canonical Task IDs, deterministic keys, the Anytime aggregate, To do initialization, revisions, validation, visibility policy, `TaskRecordView`, and in-memory core tests.
2. [ ] Define the create, update, by-ID, and date-query facade/port contracts, including same-ID create idempotency, `ID_REUSED`, version conflicts, and unchanged-state tests.
3. [ ] Implement the parameterized Tasks board adapter and source-owned summary update with `REQUEST_PLUS`, including hostile bound-value and immediate-read coverage.
4. [ ] Implement the bounded mutation executor for Task create/update, including operation-specific unambiguous failure, dispatched-timeout, exact read-back, `COMMIT_UNKNOWN`, and storage-outage tests.
5. [ ] Implement the board-composition coordinator around the Tasks and Habits queries, proving stable reads, whole-board failure, and bounded revision-churn exhaustion.
6. [ ] Add canonical-ID rejection, Origin-before-body validation, body limits, safe problems, and the create/update/by-ID/composite-read Ktor routes with focused HTTP tests.
7. [ ] Update OpenAPI for the Task operations and board union, verify the contract, and regenerate the TypeScript client.
8. [ ] Implement `/tasks` Today redirection, exact `/tasks/:date` navigation, malformed-date handling, and the stable three-column empty board.
9. [ ] Implement the unified modal shell and Anytime editor with default/future start dates, draft-preserving validation, and create behavior.
10. [ ] Add Anytime card/details editing and direct by-ID conflict reload while preserving unsaved drafts and reloading changed board visibility.
11. [ ] Add component tests for active-interval carry-forward, default/future creation, editing, empty structure, exact date navigation, and whole-board failure.
12. [ ] Add literal-text rendering tests for the first Task card and modal surfaces and verify rejected mutations create no Task.

**Acceptance Criteria:**

- Scenarios "Keep an empty Tasks board structurally stable", "Open and navigate Task dates", and "Fail a composite Tasks board as one unit" pass.
- Scenarios "Carry an Anytime task through its active interval", "Edit an Anytime task", "Create an Anytime task with the default start", and "Create an Anytime task with a future start" pass.
- Scenario "Reject a cross-origin mutation" returns `403 ORIGIN_REJECTED` before body processing and creates no Task.
- Scenario "Reject a non-canonical UUID" fails before facade or key construction.
- The board-composition coordinator returns the stable empty board when its surrounding revision is unchanged and returns a whole-board retryable error after bounded revision churn.
- Identical same-ID creation returns the existing Task; different content returns `409 ID_REUSED`.
- Rejected validation or a version conflict leaves stored state unchanged and preserves the editor draft.
- Scenario "Render user content as text" passes for the first Task card and modal surfaces.
