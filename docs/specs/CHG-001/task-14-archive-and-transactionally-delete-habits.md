# Task 14: Archive and transactionally delete Habits

**Status:** pending

**Depends on:** Task 13

**Description:** Archive from a non-past date without losing history, allow permanent deletion only before the first applicable occurrence and any progress, replace deleted personal content with a consumed-ID receipt, prevent delayed recreation, and serialize deletion with progress/lifecycle changes so no orphan progress can commit. Add archive policy and revision update with operation-specific ambiguity, timeout, and outage tests. Add the deletion transaction that reads the Habit, validates the caller version and first applicable occurrence against client Today, runs the parameterized progress-history query, and replaces the Habit with `HabitConsumedIdReceipt` only when both history checks are empty. Exclude receipts from reads, reject later creation with the consumed ID, and prove ambiguous deletion only by receipt read-back. Ensure progress transactions read the same Habit revision and resolved definition. Add archive/delete controls and named confirmation to the existing route-backed details surface.

Implementation subtasks:

1. [ ] Add archive policy tests for non-past dates, preserved history, and no occurrence on or after `archivedFrom`.
2. [ ] Implement revision-guarded archive persistence with idempotency, outage, timeout, and exact read-back coverage.
3. [ ] Define `HabitConsumedIdReceipt`, exclude it from Habit reads, and reject delayed recreation with `ID_REUSED` and no retained personal content.
4. [ ] Add deletion eligibility policy for first applicable occurrence on/before client Today and any existing progress history.
5. [ ] Implement the deletion transaction that reads Habit/version, derives first applicability, runs the parameterized progress-history query, and writes the receipt only when both checks are empty.
6. [ ] Make progress mutations read the same Habit revision/definition and add race tests proving deletion and progress yield at most one coherent lifecycle result.
7. [ ] Add rollback and ambiguity tests proving rejected transactions change neither state and ambiguous deletion succeeds only after receipt read-back.
8. [ ] Add archive/delete routes and OpenAPI/client mappings with focused `HABIT_HAS_HISTORY`, conflict, idempotency, and error tests.
9. [ ] Add archive and named delete-confirmation controls to the existing details surface with draft/error/focus behavior.
10. [ ] Add end-to-end component/integration coverage for archive, protected history, unused deletion, delayed create, and stale-lifecycle progress rejection.

**Acceptance Criteria:**

- Scenarios "Archive a Habit", "Prevent deleting Habit history", and "Delete an unused Habit" pass.
- Scenario "Prevent delayed create from reversing deletion" passes for an unused Habit.
- Scenario "Serialize Habit deletion with progress" permits at most one coherent lifecycle result.
- Scenario "Reject progress against a stale Habit lifecycle" returns `409 VERSION_CONFLICT` and creates no stale/orphan progress.
- A rejected or rolled-back lifecycle transaction changes neither Habit nor progress state.
- Archive dates before client Today are rejected and an archived Habit produces no occurrence on or after its archive date.
