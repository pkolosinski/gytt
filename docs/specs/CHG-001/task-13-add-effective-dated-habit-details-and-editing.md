# Task 13: Add effective-dated Habit details and editing

**Status:** pending

**Depends on:** Task 12

**Description:** Open the period-preserving Habit details/edit route, append caller-ID immutable definitions from a chosen effective date, retain compatible open progress, reject incompatible reinterpretation, preserve closed periods, and retry a lost definition response without duplication. Add definition IDs and aggregate-local sequences, as-of resolution, title/details-only edits, compatibility policy for open progress, revision/CAS updates, ID reuse detection, and operation-specific ambiguity/timeout/outage tests with deterministic read-back. Add the route-backed panel/full-page component shell. Task 13 owns the actual routes so its edit workflow can land green; later history work extends the same surface.

Implementation subtasks:

1. [ ] Add as-of definition resolution by effective date and aggregate-local sequence with closed-period preservation tests.
2. [ ] Add title/details-only edits plus new caller-ID immutable definition appends with non-past effective-date validation.
3. [ ] Implement open-period compatibility policy for retained progress, covering PeriodRef, applicability, target kind, numeric unit, and compatible target-amount changes.
4. [ ] Add command tests for compatible open weekly replacement, incompatible rejection without state change, and preserved closed history.
5. [ ] Add revision/CAS persistence with identical definition-ID retry, different-content `ID_REUSED`, stale non-idempotent `VERSION_CONFLICT`, outage, and ambiguity read-back tests.
6. [ ] Add Habit by-ID/edit HTTP operations and OpenAPI/client mappings for title/details and optional definitions.
7. [ ] Implement period-preserving details and edit routes with the shared panel shell on wide layouts and full-page shell on narrow layouts.
8. [ ] Add editor and route/component tests for effective dates, successful/conflicted edits, compatible/incompatible progress, retry behavior, and responsive route selection.

**Acceptance Criteria:**

- Scenarios "Replace an open weekly definition", "Reject an incompatible open-period definition", and "Preserve closed history after definition change" pass.
- Scenario "Retry a Habit definition version" returns the current Habit for identical reuse and `409 ID_REUSED` for different content.
- Scenario "Open responsive Habit details" passes at the route-selection and component-layout seam; real-browser layout remains in operator acceptance.
- Effective dates before client Today return `422 INVALID_CALENDAR_OPERATION`.
- A stale non-idempotent definition edit returns `409 VERSION_CONFLICT` without overwriting newer state.
