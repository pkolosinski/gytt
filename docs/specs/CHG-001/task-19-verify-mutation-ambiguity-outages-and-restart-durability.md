# Task 19: Verify mutation ambiguity, outages, and restart durability

**Status:** pending

**Depends on:** Task 15, Task 18

**Description:** Run cross-family regression coverage for already-implemented ambiguity and outage handling, and prove that browser, service, and database restart retain all saved Tasks, Habits, progress, and history while discarding only unsaved browser drafts. Exercise every mutation family's existing postcondition reader through a common regression matrix without adding missing production behavior here. Verify exact error/trace/redaction behavior, dispatched timeout handling, deterministic-ID reuse, and the shared retry/indeterminate UI already introduced by the mutation slices. Restart the browser harness, Ktor service, and Testcontainers Couchbase node against the same test volume and verify all source-of-truth documents and projections.

Implementation subtasks:

1. [ ] Build a mutation-family matrix mapping each implemented command to its deterministic postcondition reader, IDs, ambiguity point, and expected result.
2. [ ] Run the matrix for ambiguous single-document mutations and prove success requires the exact requested postcondition.
3. [ ] Run the matrix for ambiguous transactional mutations and prove partial or unproven results return `COMMIT_UNKNOWN`.
4. [ ] Run dispatched-timeout cases across both mutation families and verify bounded read-back and request-deadline behavior.
5. [ ] Run database-outage cases across all mutation families and verify `STORAGE_UNAVAILABLE`, no success UI, and no offline queue.
6. [ ] Add shared frontend regression coverage requiring reload after `COMMIT_UNKNOWN` and deterministic-ID reuse where applicable.
7. [ ] Restart the browser harness after acknowledged data plus an unsaved draft and prove only the draft is lost.
8. [ ] Restart Ktor against the same Couchbase state and verify Tasks, Habits, progress, history, summaries, and board projections.
9. [ ] Restart the Testcontainers Couchbase node with the same volume and repeat the source-of-truth and projection assertions.
10. [ ] Verify structured logs/counters across the matrix contain stable codes and latency but no bodies, personal fields, credentials, database content, or secrets.

**Acceptance Criteria:**

- Scenario "Reconcile an ambiguous durable mutation" reports success only when the exact requested postcondition is proven.
- Scenario "Treat a durable timeout as ambiguous" passes across single-document and transactional mutations.
- Scenario "Surface database unavailability" returns `503 STORAGE_UNAVAILABLE`, shows no success, and queues no offline change.
- Scenario "Preserve acknowledged data through restart" returns the same Tasks, Habits, progress, and history after browser, service, and database restart; only unsaved drafts are absent.
- `COMMIT_UNKNOWN` requires reload; retries reuse deterministic IDs where applicable.
- Structured logs and counters record stable codes and latency without bodies, titles, details, units, progress, credentials, or secrets.
