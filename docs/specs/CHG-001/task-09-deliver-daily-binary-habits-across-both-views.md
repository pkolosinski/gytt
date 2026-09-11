# Task 9: Deliver daily binary Habits across both views

**Status:** pending

**Depends on:** Task 4

**Description:** Deliver the daily binary Habit experience in frontend-first order. Build the Habits day view, local create modal, incomplete and collapsed Completed lists, and the Tasks-board Habit card/progress/details states against mock data; obtain UI acceptance, define the Habit create/progress/period OpenAPI contract, generate the client, and connect the frontend. Implement Habit policies, occurrence projection, persistence, progress transactions, due-day/period adapters, routes, and ambiguity/outage handling last. Do not implement Dashboard summary behavior here; Dashboard summaries belong to Tasks 24 and 17.

Implementation subtasks:

1. [ ] Build the Habits day page, local-state create modal, incomplete list, and collapsed counted Completed section with mock data.
2. [ ] Build the distinct non-draggable Habit Task card, shared binary progress control, and simple modal linking to the matching Habits day route with mock data.
3. [ ] Add component tests for mocked creation, progress from both views, completed access, and Habit-task details; obtain UI acceptance before defining the API contract.
4. [ ] Define and verify the Habit create/progress/period OpenAPI contract and regenerate the TypeScript client.
5. [ ] Connect the accepted Habits page and Tasks-board Habit card to the generated client contract.
6. [ ] Define canonical Habit/definition IDs, the Habit aggregate, immutable initial daily-binary definition, revisions/sequences, and in-memory creation tests.
7. [ ] Add deterministic day-occurrence projection, composite occurrence versions, binary states, and due-day query policy/tests; keep Dashboard summary policy out of this task.
8. [ ] Implement Habit creation persistence and the transactional absolute-progress write that reads both Habit lifecycle and progress state.
9. [ ] Add progress persistence tests for idempotent retry, stale lifecycle/version, outage, dispatched timeout, exact occurrence read-back, and `COMMIT_UNKNOWN`.
10. [ ] Add parameterized `REQUEST_PLUS` adapters for the day-period and Tasks due-day queries with hostile bound-value and immediate-read coverage; do not add a Dashboard summary adapter.
11. [ ] Add source-owned Habit create/progress/period HTTP routes and focused contract/error tests.
12. [ ] Add end-to-end regressions proving progress is immediately consistent between Habits and Tasks and Habit occurrences never enter standard Task counts.
13. [ ] Add route/focus and literal-text tests for Habit creation, list, card, Completed section, and Habit-task details surfaces.

**Acceptance Criteria:**

- A valid daily binary Habit returns the selected definition and projects only its applicable day occurrence.
- Scenarios "Create a Habit without changing the route", "Keep completed Habits accessible", "Synchronize occurrence progress between views", and "Open Habit-task details from Tasks" pass.
- Scenario "Read acknowledged progress immediately" passes for the day period and Tasks board using `REQUEST_PLUS`.
- Binary absolute progress retries are idempotent when Habit revision and definition ID still match.
- Habit occurrences remain distinct from standard Tasks in the Tasks board; Dashboard count exclusion is verified in Task 17.
- Dispatched progress timeouts return success only after exact occurrence read-back; otherwise they return `COMMIT_UNKNOWN`.
- Scenario "Render user content as text" remains green for Habit list, card, and modal surfaces.
- The daily Habit UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
- Dashboard summary policies, adapters, and card behavior remain owned by Tasks 24 and 17.
