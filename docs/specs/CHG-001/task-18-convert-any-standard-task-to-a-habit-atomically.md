# Task 18: Convert any standard Task to a Habit atomically


**Status:** pending

**Depends on:** Task 8, Task 13

**Description:**


**Behaviour:** Prefill a valid Habit from either standard Task type, then atomically create the supplied Habit/definition IDs, complete the source Task with a write-once visible reference, and increment the board-composition revision. Apply the same backdated confirmation rule, reject a different second conversion after reopening, keep composite board reads wholly before or after conversion, and reconcile ambiguous conversion commits.

**Implementation action:** Add the thin cross-capability workflow and abstract unit-of-work, with policy remaining in Tasks/Habits. Use a side-effect-free Couchbase transaction to validate Task revision and the write-once `convertedHabitId`, insert Habit, append the sequenced completion/reference, and increment the board-composition revision only for a new conversion. Add identical-retry and `TASK_ALREADY_CONVERTED` behavior, known rollback, deterministic read-back, dispatched-timeout coverage, and integration tests that pause conversion between the two board queries to prove the revision fence. Extend the existing Task modal rather than creating a second details surface.

**Verification command:** `./gradlew :core:tasks:test :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/tasks`

**Acceptance Criteria:**

- Scenarios "Prefill Task conversion" and "Convert a Task atomically" pass for Anytime and Fixed-day source Tasks.
- Scenario "Confirm a backdated conversion removes later logs" first changes neither aggregate, then commits one coherent result after confirmation.
- Scenarios "Reject a second Task conversion", "Roll back a failed conversion", and "Reconcile an ambiguous conversion" pass.
- Scenario "Fence a Tasks board during conversion" returns a state wholly before or after conversion and fails as one unit after bounded retry exhaustion.
- Transaction lambdas perform no logging, clock reads, ID generation, or external calls.
- Identical retries reuse the supplied Habit and definition IDs without duplicates.
