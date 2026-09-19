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

Choose an unused host port for the loopback-only application binding. Do not
put future proxy credentials or certificates in this repository or in Compose
values.

```sh
export GYTT_HOST_PORT='<operator-chosen-loopback-port>'
docker compose config --quiet
docker compose up --build -d gytt
```

The application is reachable from the host at
`http://127.0.0.1:${GYTT_HOST_PORT}`. For this temporary local phase, open that
address directly in the browser. The Compose file does not publish Couchbase
ports.

The smoke check uses an isolated project and a temporary loopback port:

```sh
./deploy/smoke-shell.sh
```

It builds only the `gytt` service, verifies the liveness response and CSP, and
checks that Compose resolved the application binding to `127.0.0.1`. It removes
the smoke containers and volume when it exits.

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
boundary rather than the temporary direct-localhost shell.

The current image exposes `/health/live` for container-local liveness. It does
not report configuration, versions, counts, credential state, or database
readiness. Couchbase provisioning and readiness gates are delivered in the
next implementation slice.
