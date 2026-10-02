# Task 26: Add Steps to standard Tasks

**Status:** in progress

**Depends on:** Task 5, Task 7, Task 8

**Description:** Add optional short-text Steps to standard Anytime and Fixed-day Tasks as checklist entries within the Task aggregate. Steps are shared across dates, have no user-configurable order, and do not apply to Habit occurrences or independent child Tasks. Deliver and accept the mock-backed web UI before starting contract or backend work.

Implementation subtasks:

1. [x] Update the CHG-001 product and technical specifications and plan index with Step scope, cross-date state, status rules, validation, and accessibility.
2. [x] Extend the mock-backed Tasks UI with Step text editing during create/edit, checkboxes in Task details and board cards, variable card heights, displayed-date read-only behavior, and English/Polish strings. Keep the existing Fixed-day lifecycle out of this task.
3. [x] Add focused Vitest/Testing Library coverage for the mocked Step lifecycle, keyboard access, and checkbox interaction that must not initiate card dragging.
4. [ ] Obtain UI acceptance before defining the API contract.
5. [ ] Extend the OpenAPI Task schemas and mutation contract with Steps and displayed-date context, then regenerate the TypeScript client.
6. [ ] Connect the accepted UI to the generated client and preserve draft and conflict behavior.
7. [ ] Implement Step policies in the Tasks capability, including Task revision checks, shared cross-date state, status transitions, and atomic completion behavior.
8. [ ] Add persistence and Ktor support for versioned Step updates and Task status changes; keep Step and status changes atomic.
9. [ ] Add full capability, HTTP, persistence, and regression coverage for Anytime and Fixed-day Tasks without changing Habit occurrence behavior.

**Acceptance Criteria:**

- A standard Task can have zero or more Steps with text of 1–200 Unicode code points; users cannot reorder them.
- Steps are available on Anytime and Fixed-day Tasks and are absent from Habit occurrence cards.
- Users can add, edit, and remove Step text during Task creation or editing, and check Steps from Task details or its board card.
- Checking a Step on a Task that is To do on the displayed date moves the Task to In progress on that date.
- Checking the final open Step opens a simple dialog titled "Move task [title] to Completed" with only "Yes" and "No" buttons. "Yes" moves the Task to Completed; "No" leaves the Step checked and the Task in its current status.
- Moving the whole Task directly to Completed from the board or its status menu requires no confirmation and checks all open Steps. Moving away preserves their checked state.
- Step checked state is shared across dates, while editability follows the Task's effective status on the displayed date.
- Task cards grow to show the full Step list, separate Steps with a divider, show carried-forward dates at the bottom, and are clickable and draggable from any area except the Step checkboxes.
- The mock-backed UI is accepted before the OpenAPI contract or backend implementation begins.
