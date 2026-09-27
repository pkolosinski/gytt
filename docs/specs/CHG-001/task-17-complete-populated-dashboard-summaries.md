# Task 17: Complete populated Dashboard summaries

**Status:** pending

**Depends on:** Task 16, Task 18, Task 19, Task 24

**Description:** Extend the accepted Dashboard cards with the populated Tasks/Habits states using mock data, retaining independent loading, failure, and retry behavior; obtain UI acceptance before changing the contract. Then update/verify summary response fixtures and OpenAPI schemas, regenerate the client if needed, and connect populated card states to the contract. Implement the source-owned summary policies and bounded `REQUEST_PLUS` adapters over real documents last; exclude Habit occurrences from Task counts, use explicit device Today, and preserve null Habit percentage when none are scheduled.

Implementation subtasks:

1. [ ] Build populated Tasks and Habits Dashboard card states with mock data, using explicit device Today and preserving independent request/failure/retry behavior.
2. [ ] Add component tests for the mocked minimal Dashboard fixture (two completed, three remaining, 25%, three incomplete Habits); obtain UI acceptance before contract/backend work.
3. [ ] Update and verify summary response fixtures/OpenAPI schemas as needed and regenerate the client if the contract changes.
4. [ ] Connect the accepted populated card states to the generated client contract.
5. [ ] Complete the Tasks day-summary policy and bounded adapter for completed/remaining standard Tasks, explicitly excluding Habit occurrences.
6. [ ] Complete the Habits day-summary policy and bounded adapter for scheduled/completed/percentage/incomplete occurrences, retaining null percentage when none are scheduled.
7. [ ] Add hostile bound-value and `REQUEST_PLUS` immediate-read tests for both populated summary adapters.
8. [ ] Add HTTP and end-to-end tests for the minimal Dashboard fixture and acknowledged progress.
9. [ ] Add regressions proving empty Habit presentation and independent one-card failure/retry remain unchanged; keep summary ownership in Tasks/Habits with no Dashboard persistence.

**Acceptance Criteria:**

- Scenario "Show the minimal Dashboard" shows two completed/three remaining standard Tasks and `25%` plus three incomplete Habits.
- Scenarios "Show an empty Habit summary" and "Preserve one Dashboard card when the other fails" remain green.
- Habit occurrences never affect Task summary counts.
- An immediately requested summary includes acknowledged progress through `REQUEST_PLUS`.
- The populated Dashboard UI is accepted with mock data before contract refinements and backend implementation begin.
