---
name: feature-planner
description: Use for new GYTT capabilities and consequential product or architectural changes. For small behavior changes, select a lightweight path; continue active UI drafts without restarting planning.
---

# GYTT feature workflow

## Select the smallest useful workflow

- For a clear, small change, inspect the affected code, implement, validate, and
  report. Choose this path without asking permission. No interview, plan file,
  step claim, or close-out approval is required.
- For visual changes or additions to the current draft, use `ui-designer` and
  continue the UI workshop. Feedback is not a request to restart planning.
- When intent is unclear, ask one focused question and continue once resolved.
- For a new capability or consequential product or architectural choice, agree
  the necessary decisions before implementation. Judge consequence by behavior,
  data, and boundaries, not file or line counts.

## Agree consequential decisions

1. Read `docs/product.md`, `docs/technology.md`, relevant records in
   `docs/decisions/`, and affected code. Repository evidence is authoritative
   for current implementation facts.
2. Ask one question at a time about decisions the repository cannot answer.
   Give a recommendation where useful. Stop when scope, observable acceptance
   criteria, and choices needed for the next implementation slice are clear.
3. Summarize those decisions and obtain acceptance. Reuse decisions already
   accepted in the conversation; do not repeat the interview.
4. Propose a record in `docs/decisions/` only when a decision has lasting value,
   and obtain permission before writing it. A record is not a prerequisite.

## Keep coordination proportional

Keep ordinary work and UI iteration in the conversation. Use a short temporary
plan when the user requests one, work needs coordination across sessions, or
scope benefits from persistent tracking. In the last case, propose it first.

Follow the active agent's mode and file-write restrictions; skill instructions
do not override them.

When a plan is needed:

- Agree its location. For cross-session work, it must be accessible to those
  sessions and excluded from Git; prefer ignored `.work/` when permitted.
  Ask before changing ignore rules.
- Include accepted decisions, steps with app/module areas and acceptance
  criteria, and status: `pending`, `in progress`, `blocked`, or `done`.
- Keep one plan current rather than creating parallel plans.
- Use step claims and owner labels only for multi-session work. Respect an
  existing claim; ask before taking it over if ownership or status is unclear.
- Record blockers and a brief handoff when yielding.

The user starts separate sessions manually; do not spawn agents.

## Use the applicable phases

For new UI-backed behavior, work in small reviewable slices in this order:

1. `ui-designer`: iterate on a mock-backed working draft until the user approves
   both the visible result and frontend code for progression.
2. `openapi-generator`: define or confirm the contract for the accepted behavior.
3. `web-integrator`: connect the approved frontend to that contract.
4. `backend-builder`: implement the contract and domain behavior.

Finish each applicable phase before starting the next. Existing contracts or
implementations may satisfy a phase without edits. Small changes use only the
relevant skills; backend-only work has no UI approval prerequisite. Preserve
existing data connections for small visual edits.

If implementation reveals a material product ambiguity, contract mismatch, or
architectural choice, explain the evidence and resolve only the affected
decision before dependent work continues. Preserve unaffected approvals. When
the approved UI or frontend design must change, return that slice for review;
routine integration wiring does not restart approval.

## Verify and hand back

Before each handoff, review the diff against applicable repository coding
guidance and run its relevant validation. Report results and unavailable checks
honestly.

For an integrated feature, verify the accepted behavior through the UI, API,
and persistence where applicable. Separate completed checks from unverified
runtime assumptions.

Finish with a concise result, validation, and remaining gaps. No separate
close-out approval is required, but the UI progression gate still applies.

When a temporary plan exists, leave it available while work remains; remove it
once its steps and handoffs are complete. Update durable documentation only
where an accepted lasting change warrants it.
