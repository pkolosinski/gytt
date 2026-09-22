# Task 6: Protect and order historical Task corrections


**Status:** pending

**Depends on:** Task 5

**Description:**


**Behaviour:** Reject backdated completion before a later completion until the user confirms removal of every later log, and resolve multiple accepted same-date corrections by aggregate-local sequence rather than timestamp precision.

**Implementation action:** Add `discardLaterTransitions`, the `LATER_TASK_STATUS_EXISTS` result, sequence-based ordering, and one revision/CAS write that truncates and appends atomically. Exercise ambiguity immediately before and after the truncating write so read-back proves the complete requested transition set, not merely the selected status. Add the named warning dialog and retry only after confirmation with the reloaded current version.

**Verification command:** `./gradlew :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run BackdatedCompletionDialog`

**Acceptance Criteria:**

- Scenario "Confirm backdated completion removes later logs" first changes nothing, then removes all later logs and completes the selected date after confirmation.
- Scenario "Resolve same-date Task corrections deterministically" always selects the greatest transition sequence.
- Cancelling the warning sends no confirmed mutation.
- A conflict between warning and confirmation reloads the newer Task and removes no newer log.
- Rejected and confirmed paths follow the recovery rules for unchanged state and one CAS-guarded write.
