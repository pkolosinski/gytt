# GYTT operations

This document describes the first local deployment shell from CHG-001. GYTT
does not provide authentication or HTTPS itself. The user-operated reverse
proxy remains the only browser-facing endpoint.

## Build and run

Requirements:

- JDK 17 or newer with JVM 17 compilation support.
- Docker Engine with Compose v2.
- The operator's existing HTTPS reverse proxy and locally trusted CA.

Choose the HTTPS origin and an unused host port for the loopback-only upstream.
Do not put credentials in this repository or in Compose values.

```sh
export GYTT_PUBLIC_ORIGIN='https://<operator-chosen-origin>'
export GYTT_HOST_PORT='<operator-chosen-loopback-port>'
docker compose config --quiet
docker compose up --build -d gytt
```

The application is reachable from the host at
`http://127.0.0.1:${GYTT_HOST_PORT}`. That address is an upstream target for the
external proxy, not a browser-facing HTTP endpoint. The Compose file does not
publish Couchbase ports.

The smoke check uses an isolated project and a temporary loopback port:

```sh
./deploy/smoke-shell.sh
```

It builds only the `gytt` service, verifies the liveness response and CSP, and
checks that Compose resolved the application binding to `127.0.0.1`. It removes
the smoke containers and volume when it exits.

## Reverse-proxy boundary

Configure the existing proxy to:

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

The proxy product, credential, certificate, and host port are intentionally
operator choices. GYTT has no sign-in, sign-out, account, or credential
management route.

## Runtime boundary

The server requires `GYTT_PUBLIC_ORIGIN` to be a valid HTTPS origin at startup.
The application listener binds inside the container and Compose publishes it
only on the configured loopback address. Couchbase is kept on the private
Compose network with no host or LAN port publication.

The current image exposes `/health/live` for container-local liveness. It does
not report configuration, versions, counts, credential state, or database
readiness. Couchbase provisioning and readiness gates are delivered in the
next implementation slice.
