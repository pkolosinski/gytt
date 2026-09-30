# Task 7: Add Fixed-day tasks and standard-Task copying

**Status:** pending

**Depends on:** Task 5

**Description:** Build and obtain acceptance for Fixed-day create/edit/history and standard-Task copy UI using mock data in the existing unified editor/modal. Then define the discriminated Fixed-day/copy OpenAPI contract, generate the client, and connect the accepted UI. Extend the Task model, validation, visibility, status-effective-date policy, persistence mapping, canonical caller-ID create/copy behavior, and ambiguity/outage handling last; the Fixed-day copy path remains limited to a non-completed source.

Implementation subtasks:

1. [ ] Extend the unified editor/modal with mock Fixed-day create/edit/history and copy modes for both standard Task types.
2. [ ] Add component tests for the mocked creation, date visibility, history editing, and copy flows; obtain UI acceptance before defining the API contract.
3. [ ] Define and verify OpenAPI schemas for discriminated Fixed-day fields and shared copy-via-create, then regenerate the client.
4. [ ] Connect the accepted editor/modal to the generated client contract.
5. [ ] Extend the Task model and validation with Fixed-day creation and To do initialization on the fixed date.
6. [ ] Add Fixed-day visibility/history policy and status-effective-date tests, including `INVALID_CALENDAR_OPERATION` for any other date.
7. [ ] Extend the query adapter and board mapping so past and completed Fixed-day Tasks remain reachable by exact date navigation.
8. [ ] Implement standard-Task copy through canonical caller-ID creation without mutating the source; reject completed Fixed-day sources.
9. [ ] Add persistence tests for same-ID retry, `ID_REUSED`, ambiguous create read-back, and storage outage.
10. [ ] Add end-to-end coverage for creation, date visibility, history editing, and copying without duplicating the source.

**Acceptance Criteria:**

- Scenarios "Create a Fixed-day task", "Keep a Fixed-day task on its fixed date", and "Correct a past Fixed-day task" pass.
- Scenarios "Copy a historical Task", "Copy an Anytime Task", and "Edit a historical Fixed-day task" pass without duplicating the source.
- A Fixed-day status effective date other than its fixed date returns `422 INVALID_CALENDAR_OPERATION`.
- A same-ID copy retry returns the existing copy; different content returns `409 ID_REUSED`.
- Past and completed Fixed-day Tasks remain reachable through exact date navigation.
- The Fixed-day and copy UI is accepted with mock data before its contract and backend implementation begin.
