# Task 23: Finalize private deployment and recovery acceptance

**Status:** pending

**Depends on:** Task 19, Task 20, Task 21, Task 22, Task 25

**Description:** Execute and record final acceptance of the loopback-only
application and Couchbase Console bindings, private Couchbase data network,
separate bootstrap/runtime identities, database readiness probe, runtime
traffic boundary, browser/service/database restart, backup, and recovery from
loss of the sole volume. Keep the current Compose bootstrap idempotent and
outside the server process; schema migrations and privacy attestations are not
part of this startup phase. Assemble the pinned release images and persistent
volume, and retain the external-proxy and real-browser acceptance. Record the
results and make the verification script fail when required evidence is
absent. Do not add automated browser or reverse-proxy tests.

Implementation subtasks:

1. [ ] Assemble the pinned Couchbase release, persistent volume, private data network, separate bootstrap/runtime identities, and loopback-only application and Console bindings.
2. [ ] Add deployment preflight that rejects non-loopback application or Console bindings and any published Couchbase port other than `127.0.0.1:8091`.
3. [ ] Add the readiness and same-volume restart smoke script and make it fail when required evidence is missing.
4. [ ] Verify the Couchbase data network has no external egress and the bucket-scoped runtime identity cannot administer users or cluster configuration.
5. [ ] Execute and record Basic Auth challenge, valid access, uniform invalid rejection, rate-limit recovery, authorization stripping, and direct-port isolation against the external proxy.
6. [ ] Induce a slow request and record proof that the actual proxy deadline exceeds Ktor's configured deadline.
7. [ ] Capture the Dashboard, Tasks, and Habits journeys and record that all runtime traffic stays on the configured origin or private Couchbase network.
8. [ ] Execute the supported real-browser checks for responsive layouts, focus, keyboard use, phone board containment, 200% zoom, and Local calendar navigation across time zones.
9. [ ] Restart the browser, application, and database against the retained volume and record that acknowledged data/history survives while unsaved drafts do not.
10. [ ] Create a local Couchbase backup and rehearse restoring it inside the private data boundary.
11. [ ] Document that application data-format changes require an explicit deployment plan; the server does not migrate stored data at startup.
12. [ ] Record sole-volume loss as unrecoverable without backup and finalize the evidence-backed operator checklist.

**Acceptance Criteria:**

- The operator checklist executes scenarios "Challenge unauthenticated access", "Serve authenticated access", "Reject an invalid shared credential", "Rate-limit repeated invalid credentials", "Prevent direct application access", and "Keep runtime traffic inside the private boundary".
- The checklist executes scenario "Treat a durable timeout as ambiguous" against the actual proxy/Ktor deadline ordering and records the result.
- `GET /health/ready` reports ready only when the runtime identity can perform the query and KV operations in the readiness probe.
- Scenario "Preserve Local calendar history across time zones" is covered at the capability/component seams and confirmed during operator date navigation.
- Scenario "Preserve acknowledged data through restart" is executed with browser, application, and database restart against the retained volume.
- Deployment preflight requires the application and Couchbase Console bindings to be loopback-only and rejects every other Couchbase published port.
- A local backup restore is rehearsed; no application startup migration or destructive down migration exists.
- Loss of the sole Couchbase volume is documented as unrecoverable without a local backup.
