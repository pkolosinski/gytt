# GYTT operations

This is the current local Compose deployment. Couchbase initialization runs in
a one-shot container before the Ktor server starts. The server only connects to
the initialized database and reports database readiness; it does not provision
or migrate the schema.

## Build and run

Requirements:

- JDK 17 or newer with JVM 17 compilation support.
- Docker Engine with Compose v2.
- A browser for local HTTP access.

The Compose defaults are for local development. Override them from the shell
when needed; these environment credentials are not a production secrets
solution.

```sh
export GYTT_HOST_PORT='8080'
export COUCHBASE_ADMIN_USERNAME='admin'
export COUCHBASE_ADMIN_PASSWORD='password'
export GYTT_COUCHBASE_USERNAME='gytt-app'
export GYTT_COUCHBASE_PASSWORD='gytt-app-password'
export GYTT_COUCHBASE_CONNECTION_STRING='couchbase://couchbase'
export GYTT_COUCHBASE_BUCKET='gytt'
docker compose config --quiet
docker compose up --build -d
```

Compose starts Couchbase, waits for its management UI endpoint, runs
`couchbase_bootstrap`, and starts `server` only after bootstrap succeeds. The
bootstrap initializes the single-node cluster when needed, creates the
zero-replica `gytt` bucket and `_default.tasks` / `_default.habits` collections,
and creates a separate `bucket_full_access[gytt]` application user. The server
receives only the application username and password. The bucket is retained in
the `couchbase_data` named volume.

Both the GYTT app and Couchbase Console are bound to host loopback. The app is
available at `http://127.0.0.1:${GYTT_HOST_PORT:-8080}`. The Couchbase Console
is available on the Docker host at `http://127.0.0.1:8091`; sign in using the
administrator credentials configured for Compose. This publishes port 8091
only on host loopback, not on LAN interfaces. To reach the console remotely,
open an SSH local-forward and then browse to the forwarded local address:

```sh
ssh -L 8091:127.0.0.1:8091 operator@<home-server>
```

If no host-published console port is desired, Couchbase can still be managed
with `couchbase-cli` from inside the database container using
`docker compose exec couchbase`; a browser-based Console needs a network path,
such as a temporary tunnel or proxy.

Verify the bindings and both health routes:

```sh
docker compose port server 8080
docker compose port couchbase 8091
curl --fail --silent http://127.0.0.1:${GYTT_HOST_PORT:-8080}/health/live
curl --fail --silent http://127.0.0.1:${GYTT_HOST_PORT:-8080}/health/ready
```

`/health/live` checks only that the Ktor service can respond.
`/health/ready` uses the configured application identity to insert and read a
temporary document in `_default.tasks`, query that same key with SQL++, then
delete the probe. It returns `200 {"ready":true}` only when these database
operations succeed; otherwise it returns `503 {"ready":false}` without
configuration or credential details. The Compose file does not add a separate
server healthcheck.

To rerun the idempotent bootstrap against the existing volume:

```sh
docker compose stop server
docker compose run --rm couchbase_bootstrap
docker compose up -d server
```

There is no application migration framework or startup schema migration in
this phase. Back up the local volume before manual or future schema changes.
Loss of the only Couchbase volume is unrecoverable without a local backup.

## Deferred reverse-proxy boundary

The current local shell has no authentication or HTTPS. Final MVP deployment
will configure the user-operated proxy to:

- terminate HTTPS for `GYTT_PUBLIC_ORIGIN` using the operator's trusted local CA;
- require one operator-created HTTP Basic Auth credential for `/` and `/api/v1`;
- return a native `401` challenge before forwarding unauthenticated requests;
- strip `Authorization` before forwarding and rate-limit repeated failures;
- forward to the loopback GYTT listener; and
- use an upstream timeout longer than Ktor's configured request deadline.

The proxy product, credential, certificate, and host port remain operator
choices. GYTT has no sign-in, sign-out, account, or credential-management route.

## Runtime boundary

The Compose data network is internal and has no external egress. Couchbase KV,
query, and index services are reachable by containers on that network only.
The Couchbase Console is the sole published Couchbase port and is host-loopback
only. Community Edition privacy settings are not attested by the current
bootstrap; the no-egress network is the current local data boundary. Revisit
that decision before allowing outbound connectivity or preparing a production
deployment.
