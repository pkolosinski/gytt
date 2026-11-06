---
name: web-integrator
description: Use to connect approved GYTT frontend behavior to an established HTTP contract, replacing mocks or updating existing integration. Not needed for purely visual edits that preserve data access.
---

# GYTT web integration phase

## Confirm the boundary

Read the accepted request/decisions, frontend result, API contract, affected code,
and any existing plan. For new UI-backed behavior, confirm approval of both the
visible UI and frontend code for progression.

Follow `apps/web/AGENTS.md` and `docs/agent-guidance/react.md`.

If the contract is missing or does not cover the accepted behavior, return the
specific gap to `openapi-generator`. Resolve material product or architectural
choices through `feature-planner` without restarting settled decisions.

## Connect a small slice

- Replace the relevant mock boundary with contract-backed feature data access,
  or update the existing integration.
- Keep generated code under its configured directory and adapt transport data
  in handwritten feature-owned modules.
- Preserve the approved appearance, interactions, and required loading, empty,
  error, mutation, and retry behavior. Keep user-visible text localized.
- If integration requires changing the approved UI or frontend design, explain
  the mismatch and return that slice to the workshop for review. Routine wiring
  that preserves the approved design does not require another approval round.

## Completion and handoff

Review the diff against coding guidance and run applicable web validation.

The frontend slice is ready when its data path uses the contract-backed boundary
and required presentation states are preserved. Report unavailable checks and
any behavior that could not be exercised.

Distinguish frontend/contract validation from live end-to-end verification.
If the backend is unavailable, mark runtime verification as pending; do not
present mocked success as a verified save.

Hand off operations used, validation results, and runtime assumptions to
`backend-builder` or feature close-out. Update an existing plan; claim steps
only for multi-session work.
