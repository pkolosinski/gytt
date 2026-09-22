# Task 4: Create, edit, and navigate Anytime tasks


**Status:** pending

**Depends on:** Task 3

**Description:**


**Behaviour:** Open Tasks on device Today, navigate exact LocalDates, preserve the three-column empty structure, create an Anytime task with a default or future start, edit its fields, read it directly by ID for conflict recovery, and carry it through its active interval. The board request composes the Tasks result with the public Habits due-day query behind the bounded composition-revision fence and fails as one unit.

**Implementation action:** Add canonical caller-ID validation, deterministic document keys, aggregate revisions, To do initialization, Anytime visibility policy, update constraints, `TaskRecordView`, source-owned summary updates, and parameterized board adapter. Establish the common bounded mutation executor and operation-specific ambiguity/outage tests with this first real mutation. Implement the board coordinator that reads the initial composition revision around both capability queries and retries as specified. Add body limits, safe errors, shared storage/indeterminate-result UI, the OpenAPI create/update/by-ID/composite-read contract, and generated client. Build the date routes, navigation, stable empty board, unified modal shell, discriminated Anytime editor, and literal-text rendering tests. Apply Origin validation before mutation body processing and exact postcondition read-back after ambiguous durable writes.

**Verification command:** `./gradlew :core:tasks:test :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/tasks`

**Acceptance Criteria:**

- Scenarios "Keep an empty Tasks board structurally stable", "Open and navigate Task dates", and "Fail a composite Tasks board as one unit" pass.
- Scenarios "Carry an Anytime task through its active interval", "Edit an Anytime task", "Create an Anytime task with the default start", and "Create an Anytime task with a future start" pass.
- Scenario "Reject a cross-origin mutation" returns `403 ORIGIN_REJECTED` before body processing and creates no Task.
- Scenario "Reject a non-canonical UUID" fails before facade or key construction.
- The board-composition coordinator returns the stable empty board when its surrounding revision is unchanged and returns a whole-board retryable error after bounded revision churn.
- Identical same-ID creation returns the existing Task; different content returns `409 ID_REUSED`.
- Rejected validation or a version conflict leaves stored state unchanged and preserves the editor draft.
- Scenario "Render user content as text" passes for the first Task card and modal surfaces.
