# Task 12: Add numeric Habit targets and progress

**Status:** pending

**Depends on:** Task 11

**Description:** Create numeric targets with optional units, edit progress by increment, decrement, or direct absolute entry, distinguish untouched/partial/done, prevent negative values, display uncapped percentages, and place partial day-based Habit cards in In progress. Add canonical bounded decimal strings, target/unit validation, numeric occurrence state, percentage calculation, absolute transactional writes, retry semantics, form controls, and card rendering. Increment/decrement computes a new absolute value before submission; no relative command is added.

Implementation subtasks:

1. [ ] Add canonical bounded non-negative decimal parsing/serialization plus positive-target and optional-unit validation tests.
2. [ ] Extend target/progress domain unions with numeric state resolution: zero untouched, below target partial, and target or above done.
3. [ ] Add uncapped occurrence-percentage tests, including overachievement and exact canonical decimal output.
4. [ ] Extend transactional absolute progress writes with numeric validation and the Habit/definition compatibility rule for idempotent retries.
5. [ ] Extend persistence/OpenAPI mappings and add round-trip tests for numeric targets, units, progress, negative rejection, and overachievement.
6. [ ] Add numeric target fields and increment-by-one, decrement-by-one, and direct absolute-entry controls that never submit relative commands.
7. [ ] Map day-based numeric Habit cards to To do, In progress, or Completed from progress and keep all Habit cards non-draggable.
8. [ ] Add component tests across supported schedules for numeric creation, each progress control, untouched/partial/done states, uncapped percentage, and below-zero prevention.

**Acceptance Criteria:**

- Scenarios "Create every supported Habit schedule and target", "Use binary and numeric progress controls", and "Distinguish Habit occurrence states" pass.
- Scenarios "Record numeric overachievement" and "Reject progress below zero" pass.
- Scenario "Place Habit cards by progress" maps untouched, partial, and done to To do, In progress, and Completed and disallows manual dragging.
- Numeric zero is untouched, positive below target is partial, and target or above is done.
- An absolute retry is successful only under the specified Habit/definition compatibility rule.
