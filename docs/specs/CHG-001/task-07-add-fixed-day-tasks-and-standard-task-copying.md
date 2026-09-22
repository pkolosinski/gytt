# Task 7: Add Fixed-day tasks and standard-Task copying


**Status:** pending

**Depends on:** Task 5

**Description:**


**Behaviour:** Create and edit Fixed-day tasks, show them only on their scheduled day with no overdue carry-forward, correct details/status from history, copy a non-completed historical Fixed-day Task, and copy an Anytime Task through the same standard-Task modal into one new Task.

**Implementation action:** Extend the discriminated Task model, validation, visibility, status-effective-date rule, update behavior, persistence mapping, and OpenAPI contract. Implement Copy for both standard Task types through canonical caller-ID Task creation, leaving the source unchanged; the Fixed-day product path remains limited to a non-completed source. Exercise create ambiguity, ID reuse, and storage outage through the copy workflow. Extend the unified editor/modal with Fixed-day fields and historical behavior.

**Verification command:** `./gradlew :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/tasks`

**Acceptance Criteria:**

- Scenarios "Create a Fixed-day task", "Keep a Fixed-day task on its fixed date", and "Correct a past Fixed-day task" pass.
- Scenarios "Copy a historical Task", "Copy an Anytime Task", and "Edit a historical Fixed-day task" pass without duplicating the source.
- A Fixed-day status effective date other than its fixed date returns `422 INVALID_CALENDAR_OPERATION`.
- A same-ID copy retry returns the existing copy; different content returns `409 ID_REUSED`.
- Past and completed Fixed-day Tasks remain reachable through exact date navigation.
