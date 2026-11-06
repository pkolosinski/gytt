---
name: backend-builder
description: Use for GYTT server/core implementation and backend-only changes. For new UI-backed behavior, follow the approved UI, contract, and web integration phases; internal backend changes need no UI prerequisites.
---

# GYTT backend phase

## Enter at the relevant boundary

Read the accepted request/decisions, affected code, applicable `AGENTS.md` files,
`docs/agent-guidance/kotlin.md`, the contract when HTTP behavior is involved,
and any existing plan. Inspect module boundaries and public facades first.

For a new UI-backed feature, confirm the preceding applicable phases are ready,
including approval of the visible UI and frontend code.

For backend-only work, start directly from the accepted request. Internal changes
need neither UI approval nor an artificial contract edit. Clear small changes
need no new plan.

## Implement a bounded slice

- Keep domain rules in the appropriate core capability and transport,
  persistence, configuration, and other I/O at the application boundary.
- Implement the accepted behavior and contract only. When the contract needs
  definition or correction, use `openapi-generator` before dependent work.
- If evidence reveals a material product or architectural choice, explain it
  and resolve the affected decision through `feature-planner`.
- Preserve settled decisions; return changed approved UI/frontend design to
  the workshop.

## Completion and handoff

Review the diff against applicable coding guidance. Run affected Gradle tests
and ktlint checks as described by the nearest `AGENTS.md`; report unavailable
checks and blockers honestly.

The backend slice is ready when accepted domain behavior and relevant contract
outcomes are implemented and applicable validation passes.

For an integrated feature, also exercise the accepted flow through UI, API, and
persistence where applicable, including checking that a saved change can be read
back. If runtime verification is unavailable, state that gap instead of claiming
full feature completion.

Report behavior delivered, validation evidence, and remaining gaps. Update an
existing plan; claim steps only for multi-session work. A separate close-out
approval is not required.
