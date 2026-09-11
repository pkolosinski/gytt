# GYTT operations

This document describes the first local deployment shell from CHG-001. The
temporary MVP development boundary is direct access from localhost. GYTT does
not provide authentication or HTTPS itself; the user-operated reverse proxy
will be configured during final MVP deployment.

## Build and run

Requirements:

- JDK 17 or newer with JVM 17 compilation support.
- Docker Engine with Compose v2.
- A browser for local HTTP access.
- Four private files outside the repository: runtime username, runtime
  password, Couchbase administrator username, and Couchbase administrator
  password. Each file must be readable only by its owner. The administrator
  files are mounted only into the one-shot provisioning container.

Choose an unused host port for the loopback-only application binding. Do not
put proxy credentials, Couchbase credentials, or certificates in this
repository or in Compose values.

```sh
export GYTT_HOST_PORT='<operator-chosen-loopback-port>'
export GYTT_COUCHBASE_USERNAME_FILE='<private-runtime-username-file>'
export GYTT_COUCHBASE_PASSWORD_FILE='<private-runtime-password-file>'
export GYTT_COUCHBASE_ADMIN_USERNAME_FILE='<private-admin-username-file>'
export GYTT_COUCHBASE_ADMIN_PASSWORD_FILE='<private-admin-password-file>'
export GYTT_COUCHBASE_ALLOW_COMMUNITY_PRIVACY_LIMITATIONS='true'
docker compose config --quiet
docker compose up --build -d
```

Compose starts Couchbase, waits for its management endpoint, runs the
one-shot `provision` service, and starts GYTT only after provisioning succeeds.
Provisioning initializes the cluster when necessary, records the pinned
Community Edition privacy limitations, creates the zero-replica `gytt` bucket
and `app` collections/indexes, applies the checksum-verified forward
migration, creates the bucket-scoped runtime identity, and writes the initial
board-composition document. The application does not receive administrator
credentials. The Compose data network is internal and has no external egress,
so Community Edition's immutable usage/update setting cannot send data outside
the local deployment.

The `provision` service uses longer startup budgets than the runtime service
while Couchbase initializes its query and index services. Operators can
override them with `GYTT_PROVISION_KV_TIMEOUT_MS`,
`GYTT_PROVISION_QUERY_TIMEOUT_MS`, `GYTT_PROVISION_TRANSACTION_TIMEOUT_MS`,
`GYTT_PROVISION_READBACK_TIMEOUT_MS`, and `GYTT_PROVISION_HTTP_TIMEOUT_MS`.

The application is reachable from the host at
`http://127.0.0.1:${GYTT_HOST_PORT}`. For this temporary local phase, open that
address directly in the browser. The Compose file does not publish Couchbase
ports. Verify liveness, readiness, and the deployment boundary directly:

```sh
curl --fail --silent http://127.0.0.1:${GYTT_HOST_PORT}/health/live
curl --fail --silent http://127.0.0.1:${GYTT_HOST_PORT}/health/ready
curl --fail --silent --dump-header - \
  http://127.0.0.1:${GYTT_HOST_PORT}/ -o /dev/null
docker compose port gytt 8080
```

The first request verifies liveness; readiness returns `200 {"ready":true}` only
after the runtime credential, schema version/checksum, required collections and
indexes, the recorded Community Edition privacy limitation plus its explicit
opt-in, initial document, and bounded database query all pass. It returns
`503 {"ready":false}` without configuration details or secrets otherwise. The
resolved Compose port must begin with `127.0.0.1:`, and the shell response must
include the exact CSP from the technical specification.

To rerun provisioning after stopping the application, use the same environment
variables and persistent volume:

```sh
docker compose stop gytt
docker compose run --rm provision
docker compose up -d gytt
```

Before any post-initial migration, create a local Couchbase backup or volume
snapshot inside the private data boundary. Migrations are forward-only and
checksum-verified; an applied migration must not be edited. If a newer image
is incompatible with the recorded schema, stop GYTT and restore the
pre-migration local backup before starting the prior image. Loss of the only
Couchbase volume is unrecoverable without such a backup.

## Deferred reverse-proxy boundary

Do not configure the external proxy as part of the current Task 1 work. Final
MVP deployment will configure the existing proxy to:

- terminate HTTPS for `GYTT_PUBLIC_ORIGIN` using the operator's trusted local CA;
- require one operator-created HTTP Basic Auth credential for `/` and `/api/v1`;
- return a native `401` challenge before forwarding unauthenticated requests;
- strip `Authorization` before forwarding to the loopback upstream;
- rate-limit repeated authentication failures and record only credential-free
  local proxy logs;
- forward authenticated requests to the exact `127.0.0.1:${GYTT_HOST_PORT}`
  upstream;
- use an upstream timeout longer than `GYTT_HTTP_REQUEST_TIMEOUT_MS` plus the
  documented network margin.

The proxy product, credential, certificate, and host port remain intentionally
operator choices. GYTT has no sign-in, sign-out, account, or credential
management route.

## Runtime boundary

The application listener binds inside the container and Compose publishes it
only on the configured loopback address. Couchbase is kept on the private
Compose network with no host or LAN port publication. HTTPS-origin validation
and exact Origin enforcement remain part of the later authenticated deployment
boundary rather than the temporary direct-localhost shell. A feature request
under `/api/v1` is rejected with `503` while readiness is unhealthy.

The image exposes `/health/live` for container-local liveness and
`/health/ready` for the fail-closed database gate. Readiness never reports
configuration, versions, counts, credential state, database contents, or
secret values. Set
`GYTT_COUCHBASE_ALLOW_COMMUNITY_PRIVACY_LIMITATIONS=false` in a non-Compose
deployment to require fully disabled Enterprise privacy settings; the default
is fail-closed.
