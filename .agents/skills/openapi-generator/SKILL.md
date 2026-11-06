---
name: openapi-generator
description: Use when accepted GYTT behavior needs an HTTP contract defined, changed, or checked for existing coverage. For new UI-backed behavior, enter after approval of the UI and frontend code; backend-only work needs no UI phase.
---

# GYTT API contract phase

## Establish scope and tooling

Read the accepted request/decisions, affected API consumers, repository guidance,
and any existing plan. For new UI-backed behavior, confirm the UI workshop's
progression gate was satisfied; otherwise return to `ui-designer`.

Inspect the existing contract, generator configuration, and package/build
scripts before choosing commands. Use `contracts/openapi.yaml` as the canonical
HTTP contract; if absent, add it for the accepted behavior.

Ask before adding a generator or dependency. Use `feature-planner` for
consequential unresolved decisions, not a mandatory new planning round.

## Define only the accepted boundary

- Check whether existing operations and schemas already cover the behavior.
  If they do, report that coverage rather than forcing a contract edit.
- For changes, account for the inputs, outputs, and failure outcomes needed by
  the accepted behavior and affected consumers.
- Resolve product ambiguities or incompatible assumptions before dependent
  changes; do not invent decisions.
- Update generator inputs and regenerate through the established process.
  Keep generated output machine-owned; do not hand-edit it.

## Completion and handoff

The phase is ready when accepted behavior maps to contract operations and
schemas, affected consumers are accounted for, and available contract/generation
checks have passed.

Review handwritten changes against applicable coding guidance. Report missing
tooling or unavailable checks as gaps, not successes.

Hand off the contract location, changed or reused operations, generated artifacts,
validation results, and remaining assumptions to `web-integrator` or the next
applicable consumer.

Update an existing plan; claim steps only for multi-session work. If resolving a
mismatch changes approved UI or frontend design, return the affected slice to
the UI workshop.
