# Task 14: Archive and transactionally delete Habits

**Status:** pending

**Depends on:** Task 13

**Description:** Build and obtain acceptance for mock archive/delete controls and named confirmation in the existing Habit details surface, including rejected eligibility and progress-conflict states. Then define the archive/delete OpenAPI contract, generate the client, and connect the accepted controls. Implement archive policy, consumed-ID receipts, deletion eligibility, the serialized deletion/progress transactions, persistence/query adapters, routes, and ambiguity/outage handling last. Delete is allowed only before the first applicable occurrence and any progress; receipts preserve IDs but no personal content.

Implementation subtasks:

1. [ ] Build mock archive/delete controls and named confirmation in the existing details surface, including eligibility, error, and focus states.
2. [ ] Add component tests for mocked archive/history/delete flows; obtain UI acceptance before defining the API contract.
3. [ ] Define and verify archive/delete OpenAPI mappings and regenerate the client.
4. [ ] Connect accepted archive/delete controls to the generated client contract.
5. [ ] Add archive policy for non-past dates, preserved history, and no occurrence on or after `archivedFrom`.
6. [ ] Define `HabitConsumedIdReceipt`, exclude it from reads, and reject delayed recreation with `ID_REUSED` and no retained personal content.
7. [ ] Add deletion eligibility policy for first applicable occurrence on/before client Today and any existing progress history.
8. [ ] Implement revision-guarded archive persistence and the deletion transaction, including the parameterized progress-history query and receipt write only when eligibility checks pass.
9. [ ] Make progress mutations read the same Habit revision/definition and add race tests proving deletion and progress yield at most one coherent lifecycle result.
10. [ ] Add rollback, ambiguity, outage, and timeout tests proving rejected transactions change neither state and ambiguous deletion succeeds only after receipt read-back.
11. [ ] Add source-owned archive/delete routes and end-to-end coverage for archive, protected history, unused deletion, delayed create, and stale-lifecycle progress rejection.

**Acceptance Criteria:**

- Scenarios "Archive a Habit", "Prevent deleting Habit history", and "Delete an unused Habit" pass.
- Scenario "Prevent delayed create from reversing deletion" passes for an unused Habit.
- Scenario "Serialize Habit deletion with progress" permits at most one coherent lifecycle result.
- Scenario "Reject progress against a stale Habit lifecycle" returns `409 VERSION_CONFLICT` and creates no stale/orphan progress.
- A rejected or rolled-back lifecycle transaction changes neither Habit nor progress state.
- Archive dates before client Today are rejected and an archived Habit produces no occurrence on or after its archive date.
- The archive/delete UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
