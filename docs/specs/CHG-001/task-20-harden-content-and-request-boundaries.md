# Task 20: Harden content and request boundaries


**Status:** pending

**Depends on:** Task 16, Task 17, Task 18

**Description:**


**Behaviour:** Regress every already-implemented content and request-boundary control across the complete application: literal text rendering, exact CSP and Origin behavior, bound SQL++ values, bounded requests, safe errors, and local-only runtime assets.

**Implementation action:** Audit all rendering, adapter, and error call sites against the controls implemented in their owning slices. Add only missing regression cases; do not defer first implementation of sanitization, parameter binding, body/field/range limits, Origin enforcement, or safe problem details to this task. Inspect built asset references as part of the component/build verification; runtime network confinement remains an operator acceptance item.

**Verification command:** `./gradlew :apps:server:test && ./gradlew :apps:server:integrationTest --tests 'gytt.server.couchbase.ParameterizedQueriesTest' && npm --prefix apps/web ci && npm --prefix apps/web run test && npm --prefix apps/web run build`

**Acceptance Criteria:**

- Scenarios "Render user content as text", "Bind every SQL++ value", and "Reject a cross-origin mutation" pass.
- Bodies over 64 KiB return `413 PAYLOAD_TOO_LARGE`; invalid lengths/ranges return the specified `422` error.
- CSP exactly matches the technical specification and has no permissive fallback.
- Generated runtime assets contain no CDN, remote font, analytics, telemetry, or third-party feature URL.
- Errors and logs reveal no database content or secrets.
