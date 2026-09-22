# Task 19: Verify mutation ambiguity, outages, and restart durability


**Status:** pending

**Depends on:** Task 15, Task 18

**Description:**


**Behaviour:** Run cross-family regression coverage for already-implemented ambiguity and outage handling, and prove that browser, service, and database restart retain all saved Tasks, Habits, progress, and history while discarding only unsaved browser drafts.

**Implementation action:** Exercise every mutation family's existing postcondition reader through a common regression matrix without adding missing production behavior here. Verify exact error/trace/redaction behavior, dispatched timeout handling, deterministic-ID reuse, and the shared retry/indeterminate UI already introduced by the mutation slices. Restart the browser harness, Ktor service, and Testcontainers Couchbase node against the same test volume and verify all source-of-truth documents and projections.

**Verification command:** `./gradlew :apps:server:integrationTest --tests 'gytt.server.reliability.*' && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/app`

**Acceptance Criteria:**

- Scenario "Reconcile an ambiguous durable mutation" reports success only when the exact requested postcondition is proven.
- Scenario "Treat a durable timeout as ambiguous" passes across single-document and transactional mutations.
- Scenario "Surface database unavailability" returns `503 STORAGE_UNAVAILABLE`, shows no success, and queues no offline change.
- Scenario "Preserve acknowledged data through restart" returns the same Tasks, Habits, progress, and history after browser, service, and database restart; only unsaved drafts are absent.
- `COMMIT_UNKNOWN` requires reload; retries reuse deterministic IDs where applicable.
- Structured logs and counters record stable codes and latency without bodies, titles, details, units, progress, credentials, or secrets.
