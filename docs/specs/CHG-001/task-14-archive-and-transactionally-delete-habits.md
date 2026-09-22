# Task 14: Archive and transactionally delete Habits

**Status:** pending

**Depends on:** Task 13

**Description:** Archive from a non-past date without losing history, allow permanent deletion only before the first applicable occurrence and any progress, replace deleted personal content with a consumed-ID receipt, prevent delayed recreation, and serialize deletion with progress/lifecycle changes so no orphan progress can commit. Add archive policy and revision update with operation-specific ambiguity, timeout, and outage tests. Add the deletion transaction that reads the Habit, validates the caller version and first applicable occurrence against client Today, runs the parameterized progress-history query, and replaces the Habit with `HabitConsumedIdReceipt` only when both history checks are empty. Exclude receipts from reads, reject later creation with the consumed ID, and prove ambiguous deletion only by receipt read-back. Ensure progress transactions read the same Habit revision and resolved definition. Add archive/delete controls and named confirmation to the existing route-backed details surface.

**Acceptance Criteria:**

- Scenarios "Archive a Habit", "Prevent deleting Habit history", and "Delete an unused Habit" pass.
- Scenario "Prevent delayed create from reversing deletion" passes for an unused Habit.
- Scenario "Serialize Habit deletion with progress" permits at most one coherent lifecycle result.
- Scenario "Reject progress against a stale Habit lifecycle" returns `409 VERSION_CONFLICT` and creates no stale/orphan progress.
- A rejected or rolled-back lifecycle transaction changes neither Habit nor progress state.
- Archive dates before client Today are rejected and an archived Habit produces no occurrence on or after its archive date.
