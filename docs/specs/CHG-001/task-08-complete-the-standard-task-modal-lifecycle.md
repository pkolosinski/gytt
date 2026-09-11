# Task 8: Complete the standard Task modal lifecycle

**Status:** pending

**Depends on:** Task 6, Task 7

**Description:** Use one modal for standard Task details, create/edit, copy, and deletion; require a named confirmation before permanent deletion; preserve deleted IDs without deleted personal content; and surface stale edits by loading the newer value even when it moved off the selected board. Complete update constraints and the Task-by-ID reload path. Implement versioned deletion as replacement with `TaskConsumedIdReceipt`, exclude receipts from all reads, reject later creation with the consumed ID, and prove ambiguous deletion only by receipt read-back. Add delayed-create and repeated-delete integration tests, OpenAPI mappings, conflict reload state, focus restoration, field-associated errors, and affected-control-only disabling. Keep a single modal extension point for the later conversion form rather than creating a second Task details surface.

Implementation subtasks:

1. [ ] Complete Task update constraints and by-ID conflict recovery tests, proving stale updates preserve and return the newer record.
2. [ ] Add `TaskConsumedIdReceipt` replacement semantics and exclude receipts from by-ID, board, and summary reads.
3. [ ] Add delete idempotency and delayed-create tests proving repeated delete succeeds, later create returns `ID_REUSED`, and no deleted personal content remains.
4. [ ] Add ambiguous-delete persistence tests that return success only after receipt read-back and otherwise return `COMMIT_UNKNOWN`.
5. [ ] Add the versioned delete route plus OpenAPI/client mappings and focused not-found, conflict, retry, and error tests.
6. [ ] Consolidate standard Task details, create/edit, copy, delete, and the future conversion extension point in the existing single modal.
7. [ ] Implement the named permanent-deletion confirmation so cancel sends no request and confirm deletes only the selected Task.
8. [ ] Implement `VERSION_CONFLICT` reload through `TaskRecordView`, including the case where board refresh removes the card, and never display stale-save success.
9. [ ] Add field-associated errors, focus restoration, and affected-control-only disabled states for every modal mutation.
10. [ ] Add modal lifecycle tests proving rejected/conflicted mutations preserve stored state and drafts and are safe to retry after reload.

**Acceptance Criteria:**

- Scenario "Refuse a stale Task update" returns `409 VERSION_CONFLICT`, preserves the newer Task, and reloads it.
- Scenario "Reload a Task that moved off the selected board" loads `TaskRecordView`, refreshes the board without the card, and never reports the stale edit as saved.
- Scenarios "Cancel permanent Task deletion" and "Confirm permanent Task deletion" pass.
- Selecting any standard Task card opens the same modal for details, edit, copy, and delete.
- Scenario "Prevent delayed create from reversing deletion" returns `409 ID_REUSED` and retains no deleted personal content.
- Ambiguous deletion is reported successful only after the consumed-ID receipt is read; otherwise it returns `COMMIT_UNKNOWN`.
- Rejected or conflicted mutations leave stored state unchanged and are safe to retry after reload.
