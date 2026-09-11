# Task 18: Convert any standard Task to a Habit atomically

**Status:** pending

**Depends on:** Task 8, Task 13

**Description:** Prefill a valid Habit from either standard Task type, then atomically create the supplied Habit/definition IDs, complete the source Task with a write-once visible reference, and increment the board-composition revision. Apply the same backdated confirmation rule, reject a different second conversion after reopening, keep composite board reads wholly before or after conversion, and reconcile ambiguous conversion commits. Add the thin cross-capability workflow and abstract unit-of-work, with policy remaining in Tasks/Habits. Use a side-effect-free Couchbase transaction to validate Task revision and the write-once `convertedHabitId`, insert Habit, append the sequenced completion/reference, and increment the board-composition revision only for a new conversion. Add identical-retry and `TASK_ALREADY_CONVERTED` behavior, known rollback, deterministic read-back, dispatched-timeout coverage, and integration tests that pause conversion between the two board queries to prove the revision fence. Extend the existing Task modal rather than creating a second details surface.

Implementation subtasks:

1. [ ] Add Tasks policy for write-once `convertedHabitId`, sequenced completion/reference, identical conversion retry, and `TASK_ALREADY_CONVERTED`.
2. [ ] Add Habits policy for validating and creating the caller-supplied Habit and initial definition IDs within a unit of work.
3. [ ] Implement the thin cross-capability workflow and abstract unit-of-work without moving business policy out of Tasks or Habits.
4. [ ] Implement the side-effect-free Couchbase transaction for Task validation, Habit insertion, completion/reference append, and one board-composition revision increment.
5. [ ] Add transaction tests for Anytime and Fixed-day success, identical retry without duplicates/revision increment, different second conversion, and known rollback.
6. [ ] Add backdated conversion reject/confirm tests proving the first attempt changes neither aggregate and the confirmed transaction removes later logs coherently.
7. [ ] Add ambiguous commit and dispatched-timeout reconciliation that reads both deterministic aggregates and returns success only for the complete postcondition.
8. [ ] Add board-query/conversion race tests proving the revision fence returns wholly before/after state or one retryable whole-board failure after bounded exhaustion.
9. [ ] Add the conversion HTTP/OpenAPI/client contract and focused mappings for later-log warning, second conversion, rollback, and `COMMIT_UNKNOWN`.
10. [ ] Extend the existing Task modal with prefilled Habit fields, stable caller IDs, confirmation, warning retry, and original Habit reference display.
11. [ ] Add component tests for prefill and successful conversion from both standard Task types, identical retry, rejection, and indeterminate reload behavior.

**Acceptance Criteria:**

- Scenarios "Prefill Task conversion" and "Convert a Task atomically" pass for Anytime and Fixed-day source Tasks.
- Scenario "Confirm a backdated conversion removes later logs" first changes neither aggregate, then commits one coherent result after confirmation.
- Scenarios "Reject a second Task conversion", "Roll back a failed conversion", and "Reconcile an ambiguous conversion" pass.
- Scenario "Fence a Tasks board during conversion" returns a state wholly before or after conversion and fails as one unit after bounded retry exhaustion.
- Transaction lambdas perform no logging, clock reads, ID generation, or external calls.
- Identical retries reuse the supplied Habit and definition IDs without duplicates.
