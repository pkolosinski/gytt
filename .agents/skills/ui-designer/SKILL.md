---
name: ui-designer
description: Use for GYTT visual changes, new UI drafts, and revisions or additions to the view currently being prepared. Keep UI review open until the user approves both appearance and frontend code for progression.
---

# GYTT UI workshop

## Start from the current request

Read the request, accepted decisions, affected code, and any existing plan.
Follow `apps/web/AGENTS.md` and `docs/agent-guidance/react.md`.

Use `feature-planner` when consequential decisions or cross-session coordination
need resolution. Ordinary revisions need no new interview or plan file.

## Iterate on a working draft

1. Implement a small, runnable visual or interaction slice. For new behavior not
   yet integrated, keep product data locally mocked and defer contract/backend
   work. For small edits to an integrated view, preserve its data connection.
2. Review the frontend diff against coding guidance and run applicable
   validation. Keep drafts accessible, responsive, localized, and reviewable;
   draft status is not an excuse for avoidable code-quality shortcuts.
3. Explain how to preview the result, what changed visually and in code, known
   limitations, and validation results. Distinguish an actual visual check from
   an unverified preview instruction.
4. Wait for feedback. Apply revisions and additions to the current draft, then
   repeat. Ask one focused question only when a new ambiguity blocks progress;
   reopen only the affected decision.

Update an existing plan when relevant; claim a step only for multi-session work.

## Progression gate

The workshop is complete only when the user explicitly approves both the
visible result and frontend code for progression. One clear approval covering
both is sufficient.

Positive feedback about appearance, a preview, or a request for another addition
is not authorization for later phases. If approval is ambiguous, ask one short
confirmation.

After approval, hand back the approved scope and remaining gaps. For a new
UI-backed feature, the next applicable phase is `openapi-generator`. A standalone
visual edit needs no artificial contract or backend phase.
