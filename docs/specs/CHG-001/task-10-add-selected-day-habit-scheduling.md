# Task 10: Add selected-day Habit scheduling

**Status:** pending

**Depends on:** Task 9

**Description:** Extend the Habit editor and day/Tasks mock views with selected-weekday scheduling, due/non-due presentation, and field-associated errors; obtain UI acceptance before defining the contract. Update the schedule OpenAPI union and generated client, then connect the accepted controls and views. Implement schedule validation/applicability, persistence mapping, and due-day/period query changes last. Reuse the daily occurrence identity, binary progress transaction, and Habit card; Dashboard summary behavior remains deferred to Tasks 24 and 17.

Implementation subtasks:

1. [ ] Extend the Habit editor and day/Tasks mock views with selected-weekday controls, due/non-due states, and field-associated errors.
2. [ ] Add mocked component coverage for due/non-due days and obtain UI acceptance before changing the OpenAPI contract.
3. [ ] Extend and verify the OpenAPI schedule union and regenerate the client without changing daily mappings.
4. [ ] Connect accepted selected-day controls and views to the generated client contract.
5. [ ] Add schedule validation for unique ISO weekdays `1..7`, stored and returned Monday first.
6. [ ] Add core applicability tests proving occurrences exist only on due LocalDates and reuse daily occurrence identity.
7. [ ] Extend persistence and Habits period/due-day adapters so non-due dates produce no occurrence, card, or progress identity; Dashboard summary adapters remain in Tasks 17/24.
8. [ ] Add backend and end-to-end regressions for due/non-due behavior while keeping daily behavior green.

**Acceptance Criteria:**

- Selected weekdays are unique integers `1..7` ordered Monday first.
- A selected-day occurrence appears in Tasks and Habits only on a due LocalDate.
- Non-due days do not create a Habit card or progress identity.
- Existing daily Habit behavior remains unchanged.
- The selected-day UI is accepted with mock data before contract and backend changes begin.
