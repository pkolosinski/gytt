# Task 23: Finalize private deployment and recovery acceptance

**Status:** pending

**Depends on:** Task 19, Task 20, Task 21, Task 22

**Description:** Execute and record final acceptance of the no-root, secret-mounted, loopback-only application and private Couchbase deployment, including access-boundary behavior, timeout ordering, runtime traffic inspection, browser/service/database restart, backup, compatible image rollback, incompatible-schema restoration, and unrecoverable sole-volume loss. Assemble the already-implemented pinned images, persistent volume, private ports, migration/runtime identities, secret checks, Community Edition privacy-limitation attestation, and timeout settings into the final deployment without taking ownership away from earlier tasks. Add a deployment smoke script for readiness and same-volume restart. Execute the external-proxy and real-browser checklist, including an induced slow request that proves the actual proxy deadline exceeds Ktor's, private-only traffic capture, browser restart, compatible rollback, and a local backup/restore rehearsal for an incompatible schema. Record the results and make the verification script fail when required evidence is absent. Do not add automated browser or reverse-proxy tests.

Implementation subtasks:

1. [ ] Assemble the pinned no-root application/Couchbase deployment with mounted secrets, persistent volume, private network, separate migration/runtime identities, and explicit timeout settings.
2. [ ] Add deployment preflight that rejects any non-loopback application binding or published Couchbase port before startup.
3. [ ] Add the readiness and same-volume restart smoke script and make it fail when required evidence is missing.
4. [ ] Verify provisioning/readiness remains blocked when the pinned Community Edition privacy limitation is not explicitly accepted.
5. [ ] Execute and record Basic Auth challenge, valid access, uniform invalid rejection, rate-limit recovery, authorization stripping, and direct-port isolation against the external proxy.
6. [ ] Induce a slow/ambiguous request and record proof that the actual proxy deadline exceeds Ktor's configured deadline and preserves indeterminate-result behavior.
7. [ ] Capture the Dashboard, Tasks, and Habits journeys and record that all runtime traffic stays on the configured origin or private Couchbase network.
8. [ ] Execute the supported real-browser checks for responsive layouts, focus, keyboard use, phone board containment, 200% zoom, and Local calendar navigation across time zones.
9. [ ] Restart the browser, application, and database against the retained volume and record that acknowledged data/history survives while unsaved drafts do not.
10. [ ] Create a local pre-migration backup and rehearse compatible image rollback with retained volume only when the prior image accepts the schema.
11. [ ] Rehearse incompatible rollback by stopping GYTT, restoring the pre-migration backup, and starting the prior image without a destructive down migration.
12. [ ] Record sole-volume loss as unrecoverable without backup and finalize the evidence-backed operator checklist.

**Acceptance Criteria:**

- The operator checklist executes scenarios "Challenge unauthenticated access", "Serve authenticated access", "Reject an invalid shared credential", "Rate-limit repeated invalid credentials", "Prevent direct application access", and "Keep runtime traffic inside the private boundary".
- The checklist executes scenario "Treat a durable timeout as ambiguous" against the actual proxy/Ktor deadline ordering and records the result.
- Scenario "Block readiness when privacy limitations are not accepted" remains green through provisioning and readiness checks.
- Scenario "Preserve Local calendar history across time zones" is covered at the capability/component seams and confirmed during operator date navigation.
- Scenario "Preserve acknowledged data through restart" is executed with browser, application, and database restart against the retained volume.
- Deployment preflight rejects any non-loopback application binding or published Couchbase port before containers start.
- Compatible application rollback retains the volume only when the prior image accepts the recorded schema range.
- Incompatible rollback stops GYTT, restores the pre-migration local backup, and starts the prior image; no destructive down migration exists.
- Loss of the sole Couchbase volume is documented as unrecoverable without a local backup.
