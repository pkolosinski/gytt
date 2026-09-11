# Task 7: Add Fixed-day tasks and standard-Task copying

**Status:** pending

**Depends on:** Task 5

**Description:** Create and edit Fixed-day tasks, show them only on their scheduled day with no overdue carry-forward, correct details/status from history, copy a non-completed historical Fixed-day Task, and copy an Anytime Task through the same standard-Task modal into one new Task. Extend the discriminated Task model, validation, visibility, status-effective-date rule, update behavior, persistence mapping, and OpenAPI contract. Implement Copy for both standard Task types through canonical caller-ID Task creation, leaving the source unchanged; the Fixed-day product path remains limited to a non-completed source. Exercise create ambiguity, ID reuse, and storage outage through the copy workflow. Extend the unified editor/modal with Fixed-day fields and historical behavior.

Implementation subtasks:

1. [ ] Extend the discriminated Task model and validation with Fixed-day creation, persistence mapping, and To do initialization on the fixed date.
2. [ ] Add Fixed-day visibility and historical resolution tests proving the Task appears only on its fixed date with no overdue carry-forward.
3. [ ] Add Fixed-day edit and status rules, including historical correction and `INVALID_CALENDAR_OPERATION` for any other effective date.
4. [ ] Extend the query adapter and board mapping so past and completed Fixed-day Tasks remain reachable by exact date navigation.
5. [ ] Implement standard-Task copy through canonical caller-ID creation for Anytime and eligible non-completed historical Fixed-day sources without mutating the source.
6. [ ] Add copy persistence tests for identical same-ID retry, different-content `ID_REUSED`, ambiguous create read-back, and storage outage.
7. [ ] Update OpenAPI and regenerate the client for the discriminated Fixed-day fields and shared copy-via-create workflow.
8. [ ] Extend the unified editor/modal with Fixed-day create, edit, historical correction, and copy modes.
9. [ ] Add component and integration coverage for creating, date visibility, editing history, copying both standard Task types, and never duplicating the source.

**Acceptance Criteria:**

- Scenarios "Create a Fixed-day task", "Keep a Fixed-day task on its fixed date", and "Correct a past Fixed-day task" pass.
- Scenarios "Copy a historical Task", "Copy an Anytime Task", and "Edit a historical Fixed-day task" pass without duplicating the source.
- A Fixed-day status effective date other than its fixed date returns `422 INVALID_CALENDAR_OPERATION`.
- A same-ID copy retry returns the existing copy; different content returns `409 ID_REUSED`.
- Past and completed Fixed-day Tasks remain reachable through exact date navigation.
