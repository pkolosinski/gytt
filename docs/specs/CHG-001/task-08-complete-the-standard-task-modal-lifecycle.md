# Task 8: Complete the standard Task modal lifecycle


**Status:** pending

**Depends on:** Task 6, Task 7

**Description:**


**Behaviour:** Use one modal for standard Task details, create/edit, copy, and deletion; require a named confirmation before permanent deletion; preserve deleted IDs without deleted personal content; and surface stale edits by loading the newer value even when it moved off the selected board.

**Implementation action:** Complete update constraints and the Task-by-ID reload path. Implement versioned deletion as replacement with `TaskConsumedIdReceipt`, exclude receipts from all reads, reject later creation with the consumed ID, and prove ambiguous deletion only by receipt read-back. Add delayed-create and repeated-delete integration tests, OpenAPI mappings, conflict reload state, focus restoration, field-associated errors, and affected-control-only disabling. Keep a single modal extension point for the later conversion form rather than creating a second Task details surface.

**Verification command:** `./gradlew :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/tasks`

**Acceptance Criteria:**

- Scenario "Refuse a stale Task update" returns `409 VERSION_CONFLICT`, preserves the newer Task, and reloads it.
- Scenario "Reload a Task that moved off the selected board" loads `TaskRecordView`, refreshes the board without the card, and never reports the stale edit as saved.
- Scenarios "Cancel permanent Task deletion" and "Confirm permanent Task deletion" pass.
- Selecting any standard Task card opens the same modal for details, edit, copy, and delete.
- Scenario "Prevent delayed create from reversing deletion" returns `409 ID_REUSED` and retains no deleted personal content.
- Ambiguous deletion is reported successful only after the consumed-ID receipt is read; otherwise it returns `COMMIT_UNKNOWN`.
- Rejected or conflicted mutations leave stored state unchanged and are safe to retry after reload.
