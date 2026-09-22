# Task 10: Add selected-day Habit scheduling


**Status:** pending

**Depends on:** Task 9

**Description:**


**Behaviour:** Create a Habit on unique selected ISO weekdays, project it only on due days, and expose each due occurrence through the same Habits day list and Tasks board behavior as a daily Habit.

**Implementation action:** Add selected-weekday validation and applicability to the core schedule policy, OpenAPI union, persistence mapping, editor, summary, and due-day query. Reuse the existing daily occurrence identity, binary progress transaction, and Habit card rather than adding a new path.

**Verification command:** `./gradlew :core:habits:test :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run HabitEditor`

**Acceptance Criteria:**

- Selected weekdays are unique integers `1..7` ordered Monday first.
- A selected-day occurrence appears in Tasks and Habits only on a due LocalDate.
- Non-due days do not create a card, summary count, or progress identity.
- Existing daily Habit behavior remains unchanged.
