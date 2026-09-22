# Task 2: Provision Couchbase and schema readiness

**Status:** pending

**Depends on:** Task 1

**Description:** Make the private service ready only after Couchbase, schema, permissions, disabled usage sharing, compatible migration state, and a bounded database check succeed. Add the singleton Java SDK Cluster and transaction manager, zero-replica `gytt` bucket, `app` scope, four collections, filtered secondary indexes, least-privileged runtime identity, mounted secret files with permission checks, `MAJORITY_AND_PERSIST_TO_ACTIVE`, `REQUEST_PLUS` query helper, the initial `task-board-composition::current` document, and a checksum-verified forward migration. Keep persisted documents discriminated, deterministic-ID based, and compatible with the future Couchbase Lite/Sync Gateway boundary; do not add Room/SQLite assumptions, a custom mobile change journal, or a direct mobile sync endpoint in this task. Implement all telemetry, usage-sharing, update-check, schema-compatibility, secret, privilege, and bounded database readiness gates here. Add explicit KV, query, transaction, ambiguity-read-back, and Ktor deadline configuration and reject invalid internal ordering at startup.

**Acceptance Criteria:**

- Scenario "Reject an incompatible schema at startup" keeps API readiness at `503` and accepts no feature mutation.
- Scenario "Block readiness when usage sharing is enabled" keeps readiness at `503` when any provisioning attestation is absent or false.
- Persistence tests prove user-facing SQL++ is configured for `REQUEST_PLUS`, runtime credentials cannot perform migration administration, and secret values never enter readiness responses.
- Startup rejects invalid internal timeout ordering and accepts a configuration that leaves the required ambiguity-read-back allowance.
- An interrupted migration reruns only before its checksum is recorded; checksum mismatch or incompatible partial state remains unhealthy.
- The initial schema is forward-only; incompatible reversal requires the recorded local backup procedure rather than a down migration.
- The persisted document keys and discriminators are usable as the future Couchbase Lite/Sync Gateway sync contract; no migration assumes Room/SQLite or a server-only change journal.
