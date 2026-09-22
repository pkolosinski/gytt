# Task 1: Bootstrap the local application shell

**Status:** in progress

**Depends on:** None

**Description:** Deliver the first useful end-to-end slice: start the packaged React/Ktor application on a loopback-only Compose binding, serve the static Dashboard greeting and Tasks/Habits links from local assets, and exercise it directly from localhost. Reverse-proxy authentication is deferred until final MVP deployment.

**Acceptance Criteria:**

- The application shell renders the static non-personalized greeting and links to `/tasks` and the default Habits routes from locally compiled assets.
- The packaged image starts, serves the locally built shell and exact CSP, and is reachable only through its configured loopback host socket.
- The local deployment checklist records the shell, CSP, local asset, and loopback checks.
- The resolved Compose application port is loopback-only and no unrestricted binding is provided.
- The application is reachable directly at the configured localhost port without requiring the deferred proxy.
