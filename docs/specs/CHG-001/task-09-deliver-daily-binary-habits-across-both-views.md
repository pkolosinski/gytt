# Task 9: Deliver daily binary Habits across both views

**Status:** pending

**Depends on:** Task 4

**Description:** Create a daily binary Habit with caller-generated Habit and definition IDs, project its day occurrence in Habits and Tasks, toggle absolute progress from either view, and keep completed occurrences accessible. Creation stays in local modal state; the Habit-task modal links to the matching Habits day. Add the Habit aggregate, canonical Habit and definition IDs, first immutable definition, revision/sequence fields, deterministic day occurrence, composite occurrence version, source-owned day summary, and transactional binary progress write that reads Habit and progress. Add operation-specific progress ambiguity, timeout, stale-lifecycle, and storage-outage tests now. Extend the existing composite board with a distinct non-draggable Habit card and shared progress control. Build the day page, local create modal, incomplete list, collapsed Completed section, simple Habit-task details mode, and literal-text tests for Habit fields.

**Acceptance Criteria:**

- A valid daily binary Habit returns the selected definition and projects only its applicable day occurrence.
- Scenarios "Create a Habit without changing the route", "Keep completed Habits accessible", "Synchronize occurrence progress between views", and "Open Habit-task details from Tasks" pass.
- Scenario "Read acknowledged progress immediately" passes for the day period, Tasks board, and Habit summary using `REQUEST_PLUS`.
- Binary absolute progress retries are idempotent when Habit revision and definition ID still match.
- Habit occurrences never enter the standard Task summary counts.
- Dispatched progress timeouts return success only after exact occurrence read-back; otherwise they return `COMMIT_UNKNOWN`.
- Scenario "Render user content as text" remains green for Habit list, card, and modal surfaces.
