# Task 4: Create, edit, and navigate Anytime tasks

**Status:** in progress

**Depends on:** Task 3

**Description:** Deliver the Tasks UI before its API and backend: first build and obtain acceptance for the date routes, navigation, stable three-column board, unified modal shell, discriminated Anytime editor, and conflict/error states with mock data. Then define the OpenAPI create/update/by-ID/composite-read contract, generate the client, and connect the accepted UI to that contract. Implement the capability policies, persistence adapters, mutation executor, composite-board coordinator, and Ktor routes last, including canonical caller-ID validation, deterministic keys, revisions, initial-status (default To do) initialization, Anytime visibility, update constraints, `TaskRecordView`, bounded composition-revision fencing with the public Habits due-day query, body limits, Origin-before-body validation, safe errors, exact postcondition read-back, and operation-specific ambiguity/outage tests. Dashboard summary reads are not part of this task; they are delivered in Tasks 24 and 17.

Implementation subtasks:

1. [x] Build `/tasks` Today redirection, exact `/tasks/:date` navigation, malformed-date state, and the stable three-column board with mock data.
2. [x] Build the unified modal shell and Anytime editor with mock data, title/optional-description-only creation, default start date and action-provided status, draft-preserving validation, and create/edit states.
3. [x] Build Anytime card/details and by-ID conflict-reload states with mock data, preserving drafts and representing changed board visibility; details show title, an optional description, the selected-board status menu, and Edit without a type badge or start date.
4. [x] Present the board as one joined table-like surface with per-column create actions that preselect the column status, and group date navigation with the header create action.
5. [ ] Add component tests for the mocked board, navigation, editor, carry-forward, conflict, and whole-board failure states; obtain UI acceptance before defining the API contract.
6. [ ] Define and verify the OpenAPI create/update/by-ID/composite-read contract and board union, then regenerate the TypeScript client.
7. [ ] Connect the accepted routes, board, editor, and conflict/error states to the generated client contract.
8. [ ] Define canonical Task IDs, deterministic keys, the Anytime aggregate, initial-status (default To do) initialization, revisions, validation, visibility policy, `TaskRecordView`, and in-memory core tests.
9. [ ] Define create, update, by-ID, and date-query facade/port contracts, including same-ID idempotency, `ID_REUSED`, version conflicts, and unchanged-state rules.
10. [ ] Implement the parameterized Tasks board adapter and composite-board coordinator over Tasks and Habits queries, proving immediate reads, hostile-value binding, stable reads, whole-board failure, and bounded revision-churn exhaustion.
11. [ ] Implement the bounded Task create/update mutation executor with operation-specific unambiguous failure, dispatched timeout, exact read-back, `COMMIT_UNKNOWN`, and storage-outage tests.
12. [ ] Add canonical-ID rejection, Origin-before-body validation, body limits, safe problems, and the create/update/by-ID/composite-read Ktor routes with focused HTTP tests.
13. [ ] Add persistence and end-to-end coverage proving acknowledged writes, ambiguous read-back, rejected mutations, and board behavior satisfy the accepted UI contract.

**Acceptance Criteria:**

- Scenarios "Keep an empty Tasks board structurally stable", "Open and navigate Task dates", and "Fail a composite Tasks board as one unit" pass.
- Scenarios "Carry an Anytime task through its active interval", "Edit an Anytime task", "Create an Anytime task with the default start", and "Create an Anytime task in a chosen status" pass.
- Scenario "Reject a cross-origin mutation" returns `403 ORIGIN_REJECTED` before body processing and creates no Task.
- Scenario "Reject a non-canonical UUID" fails before facade or key construction.
- The board-composition coordinator returns the stable empty board when its surrounding revision is unchanged and returns a whole-board retryable error after bounded revision churn.
- Identical same-ID creation returns the existing Task; different content returns `409 ID_REUSED`.
- Rejected validation or a version conflict leaves stored state unchanged and preserves the editor draft.
- Scenario "Render user content as text" passes for the first Task card and modal surfaces.
- The Tasks UI is accepted using mock data before the OpenAPI contract and backend implementation begin.
- Dashboard summary reads and Dashboard card behavior remain out of scope for this task.
