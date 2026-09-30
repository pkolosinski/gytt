# Task 24: Deliver independent empty Dashboard summaries

**Status:** pending

**Depends on:** Task 16, Task 18, Task 19, Task 21

**Description:** After Tasks and Habits capability and accessibility work is complete, deliver Dashboard in frontend-first order. First build and obtain acceptance for empty Tasks and Habits cards using mock data, including independent loading, error, and retry behavior. Then define the source-owned summary OpenAPI schemas, generate the client, and connect the accepted cards. Implement the Tasks/Habits summary facades, read ports, parameterized `REQUEST_PLUS` adapters, source-owned routes, common problem mapping, and redacted request logging/counters last. Do not add a backend Dashboard module or shared Dashboard persistence.

Implementation subtasks:

1. [ ] Build the empty Tasks card loading, success, failure, and card-local retry states with mock data.
2. [ ] Build the empty Habits card states with mock data so the empty summary shows no percentage and the specified empty message.
3. [ ] Add component tests proving the successful card remains visible and only the failed card is retried; obtain UI acceptance before defining the API contract.
4. [ ] Define and verify the Tasks and Habits summary OpenAPI schemas and regenerate the TypeScript client.
5. [ ] Connect the accepted Dashboard cards to the generated summary client contract.
6. [ ] Define the Tasks and Habits summary query facades/read ports and empty-result domain tests under their owning capability packages.
7. [ ] Add the Tasks summary `REQUEST_PLUS` adapter and hostile bound-value integration test, returning zero completed and remaining standard Tasks.
8. [ ] Add the Habits day-summary `REQUEST_PLUS` adapter and hostile bound-value integration test, returning no percentage, incomplete occurrences, or due occurrences.
9. [ ] Add common safe problem mapping and source-owned Tasks and Habits summary routes with focused contract/error tests.
10. [ ] Add redacted request logging/counters and failure-path tests proving storage errors never become success-shaped empty summaries.
11. [ ] Add end-to-end component and HTTP coverage for independent empty-card states and retries.

**Acceptance Criteria:**

- Scenario "Show an empty Habit summary" shows no percentage and the specified empty message.
- Scenario "Preserve one Dashboard card when the other fails" leaves the successful card visible and retries only the failed card.
- Empty Tasks summary returns zero completed and remaining standard Tasks.
- Summary routes, adapters, and tests remain under their owning Tasks and Habits packages; no server Dashboard package or shared Dashboard persistence is added.
- Storage failure is explicit and does not produce success-shaped empty data.
- Scenario "Bind every SQL++ value" passes for the summary adapters and fixed startup-validated identifiers.
- Dashboard implementation begins only after Tasks and Habits capability and accessibility work is complete.
- The empty Dashboard UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
