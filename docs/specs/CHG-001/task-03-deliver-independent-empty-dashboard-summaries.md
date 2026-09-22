# Task 3: Deliver independent empty Dashboard summaries

**Status:** pending

**Depends on:** Task 2

**Description:** Return zero standard-Task counts and no scheduled Habits from separate source-owned endpoints, and let each Dashboard card load, fail, and retry independently without creating a backend Dashboard module. Add the minimal public capability facades and read ports, parameterized `REQUEST_PLUS` adapters over the empty collections, common problem mapping, source-owned Ktor routes, canonical OpenAPI schemas, generated TypeScript client, redacted request logging/counters, and card-local loading/error/empty state. Add hostile bound-value integration coverage with the first SQL++ adapters instead of deferring injection protection. The Habits facade also exposes the due-day query needed by the future composite Tasks board; it correctly returns no occurrences while no Habit exists.

**Acceptance Criteria:**

- Scenario "Show an empty Habit summary" shows no percentage and the specified empty message.
- Scenario "Preserve one Dashboard card when the other fails" leaves the successful card visible and retries only the failed card.
- Empty Tasks summary returns zero completed and remaining standard Tasks.
- Summary routes, adapters, and tests remain under their owning Tasks and Habits packages; no server Dashboard package or shared Dashboard persistence is added.
- Storage failure is explicit and does not produce success-shaped empty data.
- Scenario "Bind every SQL++ value" passes for the summary adapters and fixed startup-validated identifiers.
