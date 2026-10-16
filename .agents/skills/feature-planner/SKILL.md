---
name: feature-planner
description: Use automatically for new GYTT features and user-visible behavior changes. Read concise product and technology context, grill one question at a time, agree decisions, prepare a short shared temporary plan, and coordinate short implementation phases.
---

# GYTT feature workflow

Use this workflow for new features. For a requested change to existing behavior,
first establish during grilling whether the full feature workflow is appropriate.
Use a lighter path for maintenance or internal refactoring that introduces no
product decision.

## Start with context and grilling

1. Read `docs/product.md`, `docs/technology.md`, relevant records in
   `docs/decisions/`, and the affected code/tests. Treat repository evidence as
   authoritative for current implementation facts.
2. Interview the user one question at a time. Ask only about intent, priorities,
   preferences, and decisions the repository cannot answer. Continue until the
   feature scope and choices needed to proceed are clear.
3. Summarize the proposed feature decisions and ask the user to accept or revise
   them. Do not close grilling until the feature decisions are accepted.
4. Separately identify decisions that may benefit future work. Ask which ones,
   if any, to add to `docs/decisions/`. Session decisions guide this feature
   whether or not they become durable records.

## Prepare the shared temporary plan

After decisions are accepted, ask where this feature's temporary plan should
live. It must be readable by the user's other sessions and excluded from Git;
prefer a location under ignored `.work/`. If the selected path is not ignored,
ask before adding it to `.gitignore` or `.git/info/exclude`.

Keep one short plan document. Include accepted decisions/context and only the
necessary step information: description and app/module area, status, and
acceptance criteria. Use `pending`, `in progress`, and `done`. A session claims
a step before editing, optionally labels its session/owner, then updates its
status and leaves a brief handoff when yielding. Do not spawn agents; the user
starts separate sessions manually.

## Choose applicable implementation phases

Keep phases short for fast feedback. Every new feature with UI follows all four
phases in this order, even when a phase confirms that an existing contract or
implementation already covers part of the feature:

1. Implement UI with mocks. Stop and present the diff for the user's explicit
   UI confirmation. Do not start later phases before confirmation.
2. Define or update the API contract.
3. Connect the web implementation to that contract.
4. Implement the backend.

Finish each applicable phase before starting the next. Independent steps within
the current phase may be handled by separate user-started sessions. Do not
perform UI work when the feature has no UI. During a behavior-change grilling,
decide whether the full sequence applies and which phases are relevant. For a
feature without UI, choose only relevant phases and respect their dependencies.

Use the focused `ui-designer`, `openapi-generator`, `web-integrator`, and
`backend-builder` skills for the active
phase. Keep the shared plan current across session handoffs.

## Close out

Confirm all steps meet their acceptance criteria and the relevant validation
has passed. Obtain any required user acceptance, including UI confirmation, and
ask the user to explicitly confirm feature close-out. Record durable outcomes
in the overview or decision records only when appropriate, then delete the
temporary plan. Do not leave feature plans in the repository after completion.
