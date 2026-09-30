# Task 3: Expose the Habits due-day query for the Tasks board

**Status:** pending

**Depends on:** Task 2

**Description:** Define the public Habits due-day query contract and its source-owned read port and parameterized `REQUEST_PLUS` adapter so Task 4 can compose day-based Habit occurrences into the Tasks board. Establish the empty-result behavior, fixed startup-validated query identifiers, and hostile bound-value coverage with this first SQL++ query. This task does not implement Dashboard summaries, routes, or card UI; Task 9 extends the query to return actual daily and selected-day occurrences.

Implementation subtasks:

1. [ ] Define the minimal public Habits due-day query facade and read-port contract under the Habits capability.
2. [ ] Define the empty due-day result and its domain tests, including the absence of weekly/monthly occurrences from the Tasks board query.
3. [ ] Implement the bounded, parameterized Habits due-day `REQUEST_PLUS` adapter over the empty collection.
4. [ ] Add hostile bound-value and immediate-read integration tests, using only startup-validated fixed query identifiers.
5. [ ] Add focused query-failure tests proving storage errors remain explicit and never become success-shaped empty results.

**Acceptance Criteria:**

- The public Habits due-day query returns no occurrences when no qualifying Habits exist.
- Due-day query values are bound; only startup-validated fixed identifiers enter SQL++ statements.
- Immediate due-day reads use `REQUEST_PLUS`, and storage failure remains explicit rather than returning an empty success.
- The query contract and adapter remain owned by Habits; no Dashboard summary, route, UI, or persistence is introduced.
