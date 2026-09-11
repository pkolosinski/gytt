# Task 9: Deliver daily binary Habits across both views

**Status:** pending

**Depends on:** Task 4

**Description:** Create a daily binary Habit with caller-generated Habit and definition IDs, project its day occurrence in Habits and Tasks, toggle absolute progress from either view, and keep completed occurrences accessible. Creation stays in local modal state; the Habit-task modal links to the matching Habits day. Add the Habit aggregate, canonical Habit and definition IDs, first immutable definition, revision/sequence fields, deterministic day occurrence, composite occurrence version, source-owned day summary, and transactional binary progress write that reads Habit and progress. Add operation-specific progress ambiguity, timeout, stale-lifecycle, and storage-outage tests now. Extend the existing composite board with a distinct non-draggable Habit card and shared progress control. Build the day page, local create modal, incomplete list, collapsed Completed section, simple Habit-task details mode, and literal-text tests for Habit fields.

Implementation subtasks:

1. [ ] Define canonical Habit/definition IDs, the Habit aggregate, immutable initial daily-binary definition, revisions/sequences, and in-memory creation tests.
2. [ ] Add deterministic day-occurrence projection, composite occurrence versions, binary states, source-owned day summary, and due-day query tests.
3. [ ] Implement Habit creation persistence and the transactional absolute-progress write that reads both Habit lifecycle and progress state.
4. [ ] Add progress persistence tests for idempotent retry, stale lifecycle/version, outage, dispatched timeout, exact occurrence read-back, and `COMMIT_UNKNOWN`.
5. [ ] Add parameterized `REQUEST_PLUS` adapters for the day period, Tasks due-day composition, and Habit summary with immediate-read coverage.
6. [ ] Add Habit create/progress/period HTTP operations and OpenAPI mappings, then regenerate the TypeScript client.
7. [ ] Build the day page, local-state create modal, incomplete list, and collapsed counted Completed section without changing the route.
8. [ ] Add the distinct non-draggable Habit Task card, shared binary progress control, and simple modal linking to the matching Habits day route.
9. [ ] Add cross-view component tests proving one absolute progress update is immediately consistent in Habits, Tasks, and the summary while never entering standard Task counts.
10. [ ] Add route/focus and literal-text tests for Habit creation, list, card, Completed section, and Habit-task details surfaces.

**Acceptance Criteria:**

- A valid daily binary Habit returns the selected definition and projects only its applicable day occurrence.
- Scenarios "Create a Habit without changing the route", "Keep completed Habits accessible", "Synchronize occurrence progress between views", and "Open Habit-task details from Tasks" pass.
- Scenario "Read acknowledged progress immediately" passes for the day period, Tasks board, and Habit summary using `REQUEST_PLUS`.
- Binary absolute progress retries are idempotent when Habit revision and definition ID still match.
- Habit occurrences never enter the standard Task summary counts.
- Dispatched progress timeouts return success only after exact occurrence read-back; otherwise they return `COMMIT_UNKNOWN`.
- Scenario "Render user content as text" remains green for Habit list, card, and modal surfaces.
