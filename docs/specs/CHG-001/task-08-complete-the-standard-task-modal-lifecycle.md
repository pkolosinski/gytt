# Task 8: Complete the standard Task modal lifecycle

**Status:** pending

**Depends on:** Task 6, Task 7

**Description:** Build and obtain acceptance for the single standard-Task details/create/edit/copy/delete modal, named confirmation, and stale-edit conflict/reload states with mock data. Then define the delete and by-ID OpenAPI contract, generate the client, and connect the accepted modal. Implement update constraints, by-ID reload, receipt-based versioned deletion, consumed-ID behavior, and ambiguity handling last. Keep a single modal extension point for the later conversion form rather than creating a second Task details surface.

Implementation subtasks:

1. [ ] Build the single details/create/edit/copy/delete modal, confirmation, conflict/reload, field-error, focus, and affected-control states with mock data.
2. [ ] Add component tests for mocked modal lifecycle, draft preservation, deletion confirmation, and conflict reload; obtain UI acceptance before defining the API contract.
3. [ ] Define and verify the versioned delete and Task-by-ID OpenAPI mappings, then regenerate the client.
4. [ ] Connect the accepted modal lifecycle and conflict/reload states to the generated client contract.
5. [ ] Complete Task update constraints and by-ID conflict policy, proving stale updates preserve and return the newer record.
6. [ ] Add `TaskConsumedIdReceipt` replacement semantics and exclude receipts from by-ID and board reads.
7. [ ] Add delete idempotency and delayed-create tests proving repeated delete succeeds, later create returns `ID_REUSED`, and no deleted personal content remains.
8. [ ] Add ambiguous-delete persistence tests that return success only after receipt read-back and otherwise return `COMMIT_UNKNOWN`.
9. [ ] Implement the Ktor delete/by-ID routes and focused not-found, conflict, retry, and error tests.
10. [ ] Add end-to-end modal tests proving rejected/conflicted mutations preserve stored state and drafts and are safe to retry after reload.

**Acceptance Criteria:**

- Scenario "Refuse a stale Task update" returns `409 VERSION_CONFLICT`, preserves the newer Task, and reloads it.
- Scenario "Reload a Task that moved off the selected board" loads `TaskRecordView`, refreshes the board without the card, and never reports the stale edit as saved.
- Scenarios "Cancel permanent Task deletion" and "Confirm permanent Task deletion" pass.
- Selecting any standard Task card opens the same modal for details, edit, copy, and delete.
- Scenario "Prevent delayed create from reversing deletion" returns `409 ID_REUSED` and retains no deleted personal content.
- Ambiguous deletion is reported successful only after the consumed-ID receipt is read; otherwise it returns `COMMIT_UNKNOWN`.
- Rejected or conflicted mutations leave stored state unchanged and are safe to retry after reload.
- The modal UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
