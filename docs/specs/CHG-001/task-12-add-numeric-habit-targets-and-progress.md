# Task 12: Add numeric Habit targets and progress

**Status:** pending

**Depends on:** Task 11

**Description:** Build and obtain acceptance for numeric Habit forms, progress controls, percentages, and day-card state placement with mock data. Then define numeric target/progress OpenAPI shapes, generate the client, and connect the accepted controls. Implement decimal/target policies, absolute transactional writes, persistence, and retry semantics last. Increment/decrement computes a new absolute value before submission; no relative command is added.

Implementation subtasks:

1. [ ] Build numeric target fields and increment/decrement/direct absolute-entry controls with mock data; ensure proposed controls represent absolute values, not relative commands.
2. [ ] Build mock progress percentages and To do/In progress/Completed placement for non-draggable day-based Habit cards.
3. [ ] Add component tests for numeric creation, progress controls, state placement, uncapped percentage, and below-zero errors; obtain UI acceptance before defining the contract.
4. [ ] Define and verify numeric target/progress OpenAPI mappings and regenerate the client.
5. [ ] Connect the accepted numeric forms and progress controls to the generated client contract.
6. [ ] Add canonical bounded non-negative decimal parsing/serialization plus positive-target and optional-unit validation tests.
7. [ ] Extend target/progress domain unions with numeric state resolution: zero untouched, below target partial, and target or above done.
8. [ ] Add uncapped occurrence-percentage policy tests, including overachievement and canonical decimal output.
9. [ ] Extend transactional absolute progress writes with numeric validation and the Habit/definition compatibility rule for idempotent retries.
10. [ ] Extend persistence mappings and add round-trip tests for numeric targets, units, progress, negative rejection, and overachievement.
11. [ ] Add backend and end-to-end component regressions across supported schedules; Dashboard summary presentation remains in Tasks 17/24.

**Acceptance Criteria:**

- Scenarios "Create every supported Habit schedule and target", "Use binary and numeric progress controls", and "Distinguish Habit occurrence states" pass.
- Scenarios "Record numeric overachievement" and "Reject progress below zero" pass.
- Scenario "Place Habit cards by progress" maps untouched, partial, and done to To do, In progress, and Completed and disallows manual dragging.
- Numeric zero is untouched, positive below target is partial, and target or above is done.
- An absolute retry is successful only under the specified Habit/definition compatibility rule.
- The numeric Habit UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
