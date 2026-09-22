# Task 17: Complete populated Dashboard summaries

**Status:** pending

**Depends on:** Task 8, Task 14

**Description:** Populate the Tasks card with completed/remaining standard Tasks and the Habits card with today's completed percentage and incomplete occurrences, while retaining independent request, failure, and retry states. Complete each capability's source-owned day-summary policy and bounded adapter over real documents. Exclude Habit occurrences from Task counts, use explicit device Today, and keep null Habit percentage for no scheduled occurrences. Finish populated card rendering without moving backend ownership into a Dashboard package.

**Acceptance Criteria:**

- Scenario "Show the minimal Dashboard" shows two completed/three remaining standard Tasks and `25%` plus three incomplete Habits.
- Scenarios "Show an empty Habit summary" and "Preserve one Dashboard card when the other fails" remain green.
- Habit occurrences never affect Task summary counts.
- An immediately requested summary includes acknowledged progress through `REQUEST_PLUS`.
