# Task 6: Protect and order historical Task corrections

**Status:** pending

**Depends on:** Task 5

**Description:** Reject backdated completion before a later completion until the user confirms removal of every later log, and resolve multiple accepted same-date corrections by aggregate-local sequence rather than timestamp precision. Add `discardLaterTransitions`, the `LATER_TASK_STATUS_EXISTS` result, sequence-based ordering, and one revision/CAS write that truncates and appends atomically. Exercise ambiguity immediately before and after the truncating write so read-back proves the complete requested transition set, not merely the selected status. Add the named warning dialog and retry only after confirmation with the reloaded current version.

Implementation subtasks:

1. [ ] Add aggregate tests proving same-effective-date corrections resolve by greatest transition sequence rather than timestamp.
2. [ ] Add detection of a backdated completion before a later completion and return `LATER_TASK_STATUS_EXISTS` with no state change when `discardLaterTransitions` is false.
3. [ ] Implement confirmed truncation and append as one revision/CAS-guarded aggregate write, removing every later transition and applying the selected completion.
4. [ ] Add stale-version tests proving a conflict between warning and confirmation reloads the newer Task and removes none of its logs.
5. [ ] Add persistence ambiguity tests immediately before and after the truncating write, requiring read-back of the complete requested transition set.
6. [ ] Extend the status HTTP/OpenAPI mapping for `discardLaterTransitions` and `LATER_TASK_STATUS_EXISTS`.
7. [ ] Implement the named warning dialog; cancellation sends no confirmed mutation and confirmation retries with the reloaded current version.
8. [ ] Add component coverage for the complete reject, cancel, confirm, conflict-reload, and successful historical-correction flow.

**Acceptance Criteria:**

- Scenario "Confirm backdated completion removes later logs" first changes nothing, then removes all later logs and completes the selected date after confirmation.
- Scenario "Resolve same-date Task corrections deterministically" always selects the greatest transition sequence.
- Cancelling the warning sends no confirmed mutation.
- A conflict between warning and confirmation reloads the newer Task and removes no newer log.
- Rejected and confirmed paths follow the recovery rules for unchanged state and one CAS-guarded write.
