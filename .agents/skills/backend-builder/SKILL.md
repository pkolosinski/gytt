---
name: backend-builder
description: Use for the backend phase of a GYTT feature after any required UI, contract, and web integration phases. Implement only the agreed contract and domain behavior in the appropriate server/core modules.
---

# GYTT backend phase

- Read accepted decisions, the API contract, and the active plan.
- Claim one backend step before editing and keep the step limited to its named
  app/module area.
- Inspect existing module boundaries and public facades before implementation.
  Keep domain rules in the appropriate core capability and transport,
  persistence, and other I/O at the application boundary.
- Implement the accepted contract and behavior only. Ask before making a
  material product or architectural choice not covered by the accepted
  decisions.
- Run affected Gradle tests and ktlint checks as described by the nearest
  `AGENTS.md`, update the plan, and leave a concise handoff or close-out report.
