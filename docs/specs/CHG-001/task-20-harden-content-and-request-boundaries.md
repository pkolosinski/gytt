# Task 20: Harden content and request boundaries

**Status:** pending

**Depends on:** Task 16, Task 17, Task 18

**Description:** Regress every already-implemented content and request-boundary control across the complete application: literal text rendering, exact CSP and Origin behavior, bound SQL++ values, bounded requests, safe errors, and local-only runtime assets. Audit all rendering, adapter, and error call sites against the controls implemented in their owning slices. Add only missing regression cases; do not defer first implementation of sanitization, parameter binding, body/field/range limits, Origin enforcement, or safe problem details to this task. Inspect built asset references as part of the component/build verification; runtime network confinement remains an operator acceptance item.

Implementation subtasks:

1. [ ] Inventory every user-content rendering surface and add missing literal-text regression cases without introducing HTML interpretation.
2. [ ] Inventory every SQL++ adapter and add missing hostile bound-value cases, verifying only startup-validated fixed identifiers enter statements.
3. [ ] Inventory every mutation route and prove exact Origin rejection occurs before body processing.
4. [ ] Add request-boundary regressions for bodies over 64 KiB and every specified title, details, unit, decimal, and range limit.
5. [ ] Verify common problem mappings and structured logs expose safe details only and never database content, request bodies, credentials, or secrets.
6. [ ] Assert the exact specified CSP on SPA and application responses with no permissive fallback.
7. [ ] Inspect built runtime asset references and fail verification on CDN, remote font, analytics, telemetry, or third-party feature URLs.
8. [ ] Run the complete content/request-boundary regression set and record any missing control in its owning slice rather than duplicating production policy here.

**Acceptance Criteria:**

- Scenarios "Render user content as text", "Bind every SQL++ value", and "Reject a cross-origin mutation" pass.
- Bodies over 64 KiB return `413 PAYLOAD_TOO_LARGE`; invalid lengths/ranges return the specified `422` error.
- CSP exactly matches the technical specification and has no permissive fallback.
- Generated runtime assets contain no CDN, remote font, analytics, telemetry, or third-party feature URL.
- Errors and logs reveal no database content or secrets.
