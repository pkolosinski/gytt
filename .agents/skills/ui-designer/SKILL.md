---
name: ui-designer
description: Use for the mock-backed UI phase of a GYTT feature, before API or backend work. Implement a reviewable UI slice, keep product data mocked, and wait for explicit user confirmation.
---

# GYTT UI phase

- Read the accepted feature decisions and the active temporary plan.
- Claim one UI step before editing; keep its scope to a small screen or
  interaction slice for fast feedback.
- Build the user-facing UI against local mocks; do not start contract or
  backend work in this phase.
- Follow `apps/web/AGENTS.md`, including accessibility, responsiveness,
  localization, generated-file boundaries, and validation commands.
- Before handing the phase back, update the plan and report the diff, screens
  and interactions changed, known gaps, and validation performed.
- Stop for the user's explicit UI confirmation. Do not proceed to another phase
  until it is granted.
