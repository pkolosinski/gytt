# Task 13: Add effective-dated Habit details and editing

**Status:** pending

**Depends on:** Task 12

**Description:** Build and obtain acceptance for the period-preserving Habit details/edit route with mock data, including title/details edits, immutable definition-version forms, compatible/incompatible progress feedback, retry, and responsive panel/full-page behavior. Then define the by-ID/edit OpenAPI contract, generate the client, and connect the accepted route. Implement definition resolution, compatibility policy, revision/CAS persistence, ID reuse and ambiguity handling last; Task 15 later extends the same surface with history.

Implementation subtasks:

1. [ ] Build the period-preserving details and edit route with mock data, including the wide panel and narrow full-page shells.
2. [ ] Build mock title/details and immutable-definition editing, effective-date validation, and compatible/incompatible progress feedback.
3. [ ] Add component tests for the mocked editor, conflict/retry, and responsive route selection; obtain UI acceptance before defining the contract.
4. [ ] Define and verify the Habit by-ID/edit OpenAPI contract and regenerate the client.
5. [ ] Connect accepted details/edit routes and forms to the generated client contract.
6. [ ] Add as-of definition resolution by effective date and aggregate-local sequence with closed-period preservation tests.
7. [ ] Add title/details edits and new caller-ID immutable definition policy with non-past effective-date validation.
8. [ ] Implement open-period compatibility policy for retained progress, covering PeriodRef, applicability, target kind, numeric unit, and compatible target-amount changes.
9. [ ] Add command tests for compatible open weekly replacement, incompatible rejection without state change, and preserved closed history.
10. [ ] Add revision/CAS persistence with identical definition-ID retry, different-content `ID_REUSED`, stale non-idempotent `VERSION_CONFLICT`, outage, and ambiguity read-back tests.
11. [ ] Add source-owned Habit by-ID/edit routes and end-to-end tests for the accepted UI contract.

**Acceptance Criteria:**

- Scenarios "Replace an open weekly definition", "Reject an incompatible open-period definition", and "Preserve closed history after definition change" pass.
- Scenario "Retry a Habit definition version" returns the current Habit for identical reuse and `409 ID_REUSED` for different content.
- Scenario "Open responsive Habit details" passes at the route-selection and component-layout seam; real-browser layout remains in operator acceptance.
- Effective dates before client Today return `422 INVALID_CALENDAR_OPERATION`.
- A stale non-idempotent definition edit returns `409 VERSION_CONFLICT` without overwriting newer state.
- The details/edit UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
