# Task 23: Finalize private deployment and recovery acceptance


**Status:** pending

**Depends on:** Task 19, Task 20, Task 21, Task 22

**Description:**


**Behaviour:** Execute and record final acceptance of the no-root, secret-mounted, loopback-only application and private Couchbase deployment, including access-boundary behavior, timeout ordering, runtime traffic inspection, browser/service/database restart, backup, compatible image rollback, incompatible-schema restoration, and unrecoverable sole-volume loss.

**Implementation action:** Assemble the already-implemented pinned images, persistent volume, private ports, migration/runtime identities, secret checks, telemetry attestations, and timeout settings into the final deployment without taking ownership away from earlier tasks. Add a deployment smoke script for readiness and same-volume restart. Execute the external-proxy and real-browser checklist, including an induced slow request that proves the actual proxy deadline exceeds Ktor's, private-only traffic capture, browser restart, compatible rollback, and a local backup/restore rehearsal for an incompatible schema. Record the results and make the verification script fail when required evidence is absent. Do not add automated browser or reverse-proxy tests.

**Verification command:** `./deploy/preflight.sh && ./gradlew check :apps:server:integrationTest :apps:server:performanceTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test && npm --prefix apps/web run build && docker compose build && ./deploy/smoke-deployment.sh && ./deploy/verify-operator-acceptance.sh`

**Acceptance Criteria:**

- The operator checklist executes scenarios "Challenge unauthenticated access", "Serve authenticated access", "Reject an invalid shared credential", "Rate-limit repeated invalid credentials", "Prevent direct application access", and "Keep runtime traffic inside the private boundary".
- The checklist executes scenario "Treat a durable timeout as ambiguous" against the actual proxy/Ktor deadline ordering and records the result.
- Scenario "Block readiness when usage sharing is enabled" remains green through provisioning and readiness checks.
- Scenario "Preserve Local calendar history across time zones" is covered at the capability/component seams and confirmed during operator date navigation.
- Scenario "Preserve acknowledged data through restart" is executed with browser, application, and database restart against the retained volume.
- Deployment preflight rejects any non-loopback application binding or published Couchbase port before containers start.
- Compatible application rollback retains the volume only when the prior image accepts the recorded schema range.
- Incompatible rollback stops GYTT, restores the pre-migration local backup, and starts the prior image; no destructive down migration exists.
- Loss of the sole Couchbase volume is documented as unrecoverable without a local backup.
