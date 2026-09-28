# Task 6: Protect and order historical Task corrections

**Status:** pending

**Depends on:** Task 5

**Description:** Build the named historical-correction warning and reject/cancel/confirm/conflict-reload UI with mock data, then obtain UI acceptance. Add the `discardLaterTransitions` and `LATER_TASK_STATUS_EXISTS` OpenAPI contract, generate the client, and connect the accepted flow. Implement sequence-based ordering, backdate policy, atomic revision/CAS truncation and append, and ambiguity read-back last.

Implementation subtasks:

1. [ ] Build the named warning dialog and reject/cancel/confirm/conflict-reload states with mock data; cancellation sends no confirmed mutation.
2. [ ] Add component coverage for the mocked correction flow and obtain UI acceptance before defining the API contract.
3. [ ] Extend and verify the status OpenAPI mapping for `discardLaterTransitions` and `LATER_TASK_STATUS_EXISTS`, then regenerate the client.
4. [ ] Connect the accepted warning and confirmation flow to the generated client contract.
5. [ ] Add aggregate tests proving same-effective-date corrections resolve by greatest transition sequence rather than timestamp.
6. [ ] Add policy detection for backdated completion before a later completion and return `LATER_TASK_STATUS_EXISTS` without state change when confirmation is absent.
7. [ ] Implement confirmed truncation and append as one revision/CAS-guarded aggregate write, removing every later transition and applying the selected completion.
8. [ ] Add stale-version and persistence ambiguity tests, requiring reload of the newer Task and exact read-back of the complete requested transition set.
9. [ ] Add route and end-to-end tests for reject, cancel, confirm, conflict reload, and successful correction.

**Acceptance Criteria:**

- Scenario "Confirm backdated completion removes later logs" first changes nothing, then removes all later logs and completes the selected date after confirmation.
- Scenario "Resolve same-date Task corrections deterministically" always selects the greatest transition sequence.
- Cancelling the warning sends no confirmed mutation.
- A conflict between warning and confirmation reloads the newer Task and removes no newer log.
- Rejected and confirmed paths follow the recovery rules for unchanged state and one CAS-guarded write.
- The correction UI is accepted with mock data before its contract and backend behavior are implemented.
