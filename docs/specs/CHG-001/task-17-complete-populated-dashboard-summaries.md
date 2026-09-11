# Task 17: Complete populated Dashboard summaries

**Status:** pending

**Depends on:** Task 8, Task 14

**Description:** Populate the Tasks card with completed/remaining standard Tasks and the Habits card with today's completed percentage and incomplete occurrences, while retaining independent request, failure, and retry states. Complete each capability's source-owned day-summary policy and bounded adapter over real documents. Exclude Habit occurrences from Task counts, use explicit device Today, and keep null Habit percentage for no scheduled occurrences. Finish populated card rendering without moving backend ownership into a Dashboard package.

Implementation subtasks:

1. [ ] Complete the Tasks day-summary policy for completed and remaining standard Tasks and explicitly exclude Habit occurrences.
2. [ ] Complete the bounded Tasks `REQUEST_PLUS` summary adapter over populated Task documents with immediate-read tests.
3. [ ] Complete the Habits day-summary policy for scheduled, completed, percentage, and incomplete occurrences, retaining null percentage when none are scheduled.
4. [ ] Complete the bounded Habits `REQUEST_PLUS` summary adapter with acknowledged-progress immediate-read tests.
5. [ ] Add capability/HTTP tests for the "Show the minimal Dashboard" fixture: two completed, three remaining, `25%`, and three incomplete Habits.
6. [ ] Finish populated Tasks and Habits card rendering using explicit device Today and existing independent query states.
7. [ ] Add component regressions proving empty Habit presentation and one-card failure/retry behavior remain unchanged.
8. [ ] Verify all backend summary code remains source-owned with no Dashboard package or persistence.

**Acceptance Criteria:**

- Scenario "Show the minimal Dashboard" shows two completed/three remaining standard Tasks and `25%` plus three incomplete Habits.
- Scenarios "Show an empty Habit summary" and "Preserve one Dashboard card when the other fails" remain green.
- Habit occurrences never affect Task summary counts.
- An immediately requested summary includes acknowledged progress through `REQUEST_PLUS`.
