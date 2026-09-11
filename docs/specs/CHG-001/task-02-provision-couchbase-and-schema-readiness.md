# Task 2: Bootstrap Couchbase and database readiness

**Status:** done

**Depends on:** Task 1

**Description:** Initialize Couchbase in the one-shot Compose bootstrap before
the server starts. Create the zero-replica `gytt` bucket, the existing
`_default.tasks` and `_default.habits` collections, and a separate
bucket-scoped application user. Keep cluster, bucket, collection, and user
provisioning out of the long-running server. Configure its single Kotlin SDK
connection from environment-backed `CouchbaseConfiguration`; make readiness
prove bounded KV write/read and SQL++ query access without schema migrations or
privacy-attestation gates.

**Acceptance Criteria:**

- Compose waits for Couchbase to become healthy, waits for bootstrap to exit
  successfully, and starts the server afterward.
- Bootstrap is idempotent for cluster initialization, the bucket, both
  `_default` collections, and the application user; the runtime identity has
  bucket-scoped access and differs from the administrator.
- The server reads its connection string, username, password, and bucket from
  environment-backed configuration and never connects as the administrator.
- `GET /health/ready` returns `200 {"ready":true}` only when the configured
  application identity can insert, read, query, and delete a temporary
  document in `_default.tasks`; failed database access returns
  `503 {"ready":false}` without exposing database details.
- `GET /health/live` remains independent of Couchbase availability.
- Server startup does not create or validate schema, collections, indexes,
  migration records, or privacy attestations.
