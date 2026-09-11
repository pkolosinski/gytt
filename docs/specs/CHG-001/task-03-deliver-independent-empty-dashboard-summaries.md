# Task 3: Deliver independent empty Dashboard summaries

**Status:** pending

**Depends on:** Task 2

**Description:** Return zero standard-Task counts and no scheduled Habits from separate source-owned endpoints, and let each Dashboard card load, fail, and retry independently without creating a backend Dashboard module. Add the minimal public capability facades and read ports, parameterized `REQUEST_PLUS` adapters over the empty collections, common problem mapping, source-owned Ktor routes, canonical OpenAPI schemas, generated TypeScript client, redacted request logging/counters, and card-local loading/error/empty state. Add hostile bound-value integration coverage with the first SQL++ adapters instead of deferring injection protection. The Habits facade also exposes the due-day query needed by the future composite Tasks board; it correctly returns no occurrences while no Habit exists.

Implementation subtasks:

1. [ ] Define the minimal public Tasks and Habits summary query facades, read ports, and empty-result domain tests under their owning capability packages.
2. [ ] Add the Tasks summary `REQUEST_PLUS` adapter and hostile bound-value integration test, returning zero completed and remaining standard Tasks from the empty collection.
3. [ ] Add the Habits day-summary and due-day `REQUEST_PLUS` adapters and hostile bound-value integration tests, returning no percentage, incomplete occurrences, or due occurrences from the empty collections.
4. [ ] Add common safe problem mapping plus the source-owned Tasks summary route and its HTTP/OpenAPI contract tests.
5. [ ] Add the source-owned Habits summary route and its HTTP/OpenAPI contract tests without introducing a server Dashboard package or shared Dashboard persistence.
6. [ ] Regenerate the TypeScript client and add redacted request logging and counters for both summary routes.
7. [ ] Implement the empty Tasks card loading, success, failure, and card-local retry states.
8. [ ] Implement the empty Habits card states so scenario "Show an empty Habit summary" renders no percentage and the specified empty message.
9. [ ] Add the independent-card component test for scenario "Preserve one Dashboard card when the other fails", proving only the failed request is retried.
10. [ ] Add failure-path tests proving storage errors stay explicit and never become success-shaped empty summaries.

**Acceptance Criteria:**

- Scenario "Show an empty Habit summary" shows no percentage and the specified empty message.
- Scenario "Preserve one Dashboard card when the other fails" leaves the successful card visible and retries only the failed card.
- Empty Tasks summary returns zero completed and remaining standard Tasks.
- Summary routes, adapters, and tests remain under their owning Tasks and Habits packages; no server Dashboard package or shared Dashboard persistence is added.
- Storage failure is explicit and does not produce success-shaped empty data.
- Scenario "Bind every SQL++ value" passes for the summary adapters and fixed startup-validated identifiers.
