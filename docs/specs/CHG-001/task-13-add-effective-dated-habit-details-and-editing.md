# Task 13: Add effective-dated Habit details and editing


**Status:** pending

**Depends on:** Task 12

**Description:**


**Behaviour:** Open the period-preserving Habit details/edit route, append caller-ID immutable definitions from a chosen effective date, retain compatible open progress, reject incompatible reinterpretation, preserve closed periods, and retry a lost definition response without duplication.

**Implementation action:** Add definition IDs and aggregate-local sequences, as-of resolution, title/details-only edits, compatibility policy for open progress, revision/CAS updates, ID reuse detection, and operation-specific ambiguity/timeout/outage tests with deterministic read-back. Add the route-backed panel/full-page component shell. Task 13 owns the actual routes so its edit workflow can land green; later history work extends the same surface.

**Verification command:** `./gradlew :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/habits`

**Acceptance Criteria:**

- Scenarios "Replace an open weekly definition", "Reject an incompatible open-period definition", and "Preserve closed history after definition change" pass.
- Scenario "Retry a Habit definition version" returns the current Habit for identical reuse and `409 ID_REUSED` for different content.
- Scenario "Open responsive Habit details" passes at the route-selection and component-layout seam; real-browser layout remains in operator acceptance.
- Effective dates before client Today return `422 INVALID_CALENDAR_OPERATION`.
- A stale non-idempotent definition edit returns `409 VERSION_CONFLICT` without overwriting newer state.
