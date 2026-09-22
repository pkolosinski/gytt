# Task 1: Bootstrap the local application shell


**Status:** in progress

**Depends on:** None

**Description:**


**Behaviour:** Deliver the first useful end-to-end slice: start the packaged React/Ktor application on a loopback-only Compose binding, serve the static Dashboard greeting and Tasks/Habits links from local assets, and exercise it directly from localhost. Reverse-proxy authentication is deferred until final MVP deployment.

**Implementation subtasks:**

1. **Pin and verify the JVM build**
   - **Status:** done
   - Confirm the Gradle wrapper, JVM target, Kotlin version, Ktor version, and server build task are reproducible.
   - Verified with `./gradlew :apps:server:compileKotlin`; the build completed successfully using Gradle 9.7.1 and JVM toolchain 17.

2. **Pin and verify the web build**
   - **Status:** done
   - Confirmed the committed `apps/web` lockfile installs with pnpm 12.4.2 and that the Vite production build succeeds.
   - Verified with `corepack pnpm --dir apps/web install --frozen-lockfile && corepack pnpm --dir apps/web build`.

3. **Replace the starter Dashboard content**
   - **Status:** done
   - Replaced the Vite demo with the static non-personalized greeting and local links to `/tasks` and `/habits/day`.
   - Kept the change limited to the Dashboard shell and its Tailwind utility classes.

4. **Add placeholder Tasks and Habits routes**
   - **Status:** done
   - Added local placeholder screens for `/tasks`, `/habits/day`, `/habits/week`, and `/habits/month` so the Dashboard and default period routes resolve within the SPA.
   - Do not implement task or habit behavior in this subtask.

5. **Add the server liveness endpoint**
   - **Status:** pending
   - Add the private `/health/live` response required by container checks.
   - Keep the endpoint free of configuration, credential, database, and personal-data details.

6. **Add request trace IDs**
   - **Status:** pending
   - Generate or propagate a request trace ID at the Ktor boundary and include it in the response and structured request logging.
   - Never log authorization headers or request bodies.

7. **Add the exact Content Security Policy**
   - **Status:** pending
   - Serve the specified self-contained CSP on the SPA response and verify that no permissive fallback is emitted.
   - Keep runtime assets local to the packaged application.

8. **Package the compiled SPA in the server image**
   - **Status:** pending
   - Make the multi-stage image copy the web production output into Ktor classpath resources and serve it from the packaged runtime image.
   - Verify that the runtime image contains no development server dependency.

9. **Restrict the Compose application binding**
   - **Status:** pending
   - Publish the application only on `127.0.0.1:${GYTT_HOST_PORT}` and remove all Couchbase host-port publications.
   - Preserve the private Compose network between the application and Couchbase.

10. **Add the local Docker smoke script**
    - **Status:** pending
    - Create `deploy/smoke-shell.sh` to build and start the application service, request liveness and the shell, check the exact CSP, verify the resolved loopback binding, and clean up on success or failure.
    - Do not configure or test the deferred external proxy.

11. **Record the local operator checks**
    - **Status:** pending
    - Update the local acceptance evidence for the greeting, module links, CSP, local assets, loopback binding, and unpublished Couchbase ports.
    - Leave HTTPS, Basic Auth, rate limiting, credential stripping, and proxy-bypass checks deferred to final MVP deployment.

12. **Run the complete Task 1 verification**
    - **Status:** pending
    - Run the documented server tests, web tests, web build, and local Docker smoke script together.
    - Mark Task 1 complete only after all required checks pass.

**Verification command:** `./gradlew :apps:server:test && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/app && npm --prefix apps/web run build && ./deploy/smoke-shell.sh`

**Acceptance Criteria:**

- The application shell renders the static non-personalized greeting and links to `/tasks` and the default Habits routes from locally compiled assets.
- The packaged image starts, serves the locally built shell and exact CSP, and is reachable only through its configured loopback host socket.
- The local deployment checklist records the shell, CSP, local asset, and loopback checks.
- The resolved Compose application port is loopback-only and no unrestricted binding is provided.
- The application is reachable directly at the configured localhost port without requiring the deferred proxy.
