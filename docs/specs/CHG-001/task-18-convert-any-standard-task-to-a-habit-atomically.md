# Task 18: Convert any standard Task to a Habit atomically

**Status:** pending

**Depends on:** Task 8, Task 13

**Description:** Build and obtain acceptance for the Task-to-Habit prefill, backdated-warning, confirmation, retry, and reference-display flow in the existing Task modal with mock data. Then define the conversion OpenAPI contract, generate the client, and connect the accepted modal. Implement the Tasks/Habits policies, thin cross-capability workflow, abstract unit-of-work, Couchbase transaction, revision fence, and ambiguity/rollback handling last. Keep policy in Tasks/Habits and the transaction side-effect-free; a new conversion atomically creates the supplied Habit/definition IDs, completes and references the Task, and increments the board-composition revision.

Implementation subtasks:

1. [ ] Extend the existing Task modal with mock prefilled Habit fields, stable caller IDs, backdate warning, confirmation, retry, and original Habit reference states.
2. [ ] Add component tests for mocked conversion from both standard Task types, identical retry, rejection, and indeterminate reload; obtain UI acceptance before defining the contract.
3. [ ] Define and verify the conversion OpenAPI contract and focused mappings for later-log warning, second conversion, rollback, and `COMMIT_UNKNOWN`; regenerate the client.
4. [ ] Connect the accepted Task modal conversion flow to the generated client contract.
5. [ ] Add Tasks policy for write-once `convertedHabitId`, sequenced completion/reference, identical conversion retry, and `TASK_ALREADY_CONVERTED`.
6. [ ] Add Habits policy for validating and creating the caller-supplied Habit and initial definition IDs within a unit of work.
7. [ ] Implement the thin cross-capability workflow and abstract unit-of-work without moving business policy out of Tasks or Habits.
8. [ ] Implement the side-effect-free Couchbase transaction for Task validation, Habit insertion, completion/reference append, and one board-composition revision increment.
9. [ ] Add transaction tests for Anytime and Fixed-day success, identical retry without duplicates/revision increment, different second conversion, known rollback, and backdated reject/confirm behavior.
10. [ ] Add ambiguous commit and dispatched-timeout reconciliation that reads both deterministic aggregates and returns success only for the complete postcondition.
11. [ ] Add board-query/conversion race tests proving the revision fence returns wholly before/after state or a retryable whole-board failure after bounded exhaustion.
12. [ ] Add conversion routes and end-to-end tests proving the accepted modal contract and conversion outcomes.

**Acceptance Criteria:**

- Scenarios "Prefill Task conversion" and "Convert a Task atomically" pass for Anytime and Fixed-day source Tasks.
- Scenario "Confirm a backdated conversion removes later logs" first changes neither aggregate, then commits one coherent result after confirmation.
- Scenarios "Reject a second Task conversion", "Roll back a failed conversion", and "Reconcile an ambiguous conversion" pass.
- Scenario "Fence a Tasks board during conversion" returns a state wholly before or after conversion and fails as one unit after bounded retry exhaustion.
- Transaction lambdas perform no logging, clock reads, ID generation, or external calls.
- Identical retries reuse the supplied Habit and definition IDs without duplicates.
- The conversion UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
