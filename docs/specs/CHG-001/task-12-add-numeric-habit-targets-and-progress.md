# Task 12: Add numeric Habit targets and progress

**Status:** pending

**Depends on:** Task 11

**Description:** Create numeric targets with optional units, edit progress by increment, decrement, or direct absolute entry, distinguish untouched/partial/done, prevent negative values, display uncapped percentages, and place partial day-based Habit cards in In progress. Add canonical bounded decimal strings, target/unit validation, numeric occurrence state, percentage calculation, absolute transactional writes, retry semantics, form controls, and card rendering. Increment/decrement computes a new absolute value before submission; no relative command is added.

**Acceptance Criteria:**

- Scenarios "Create every supported Habit schedule and target", "Use binary and numeric progress controls", and "Distinguish Habit occurrence states" pass.
- Scenarios "Record numeric overachievement" and "Reject progress below zero" pass.
- Scenario "Place Habit cards by progress" maps untouched, partial, and done to To do, In progress, and Completed and disallows manual dragging.
- Numeric zero is untouched, positive below target is partial, and target or above is done.
- An absolute retry is successful only under the specified Habit/definition compatibility rule.
