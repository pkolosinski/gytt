# Task 10: Add selected-day Habit scheduling

**Status:** pending

**Depends on:** Task 9

**Description:** Create a Habit on unique selected ISO weekdays, project it only on due days, and expose each due occurrence through the same Habits day list and Tasks board behavior as a daily Habit. Add selected-weekday validation and applicability to the core schedule policy, OpenAPI union, persistence mapping, editor, summary, and due-day query. Reuse the existing daily occurrence identity, binary progress transaction, and Habit card rather than adding a new path.

Implementation subtasks:

1. [ ] Add selected-days schedule validation for unique ISO weekdays `1..7` stored and returned Monday first.
2. [ ] Add core applicability tests proving selected-day occurrences exist only on due LocalDates and reuse the daily occurrence identity.
3. [ ] Extend persistence and OpenAPI schedule unions for selected days without changing daily mappings.
4. [ ] Extend the Habits period, summary, and due-day adapters so non-due dates produce no occurrence, count, card, or progress identity.
5. [ ] Extend the Habit editor with selected-weekday controls and field-associated validation.
6. [ ] Add integration/component regression coverage for due and non-due Habits and Tasks views while keeping all existing daily behavior green.

**Acceptance Criteria:**

- Selected weekdays are unique integers `1..7` ordered Monday first.
- A selected-day occurrence appears in Tasks and Habits only on a due LocalDate.
- Non-due days do not create a card, summary count, or progress identity.
- Existing daily Habit behavior remains unchanged.
