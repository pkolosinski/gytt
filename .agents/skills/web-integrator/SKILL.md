---
name: web-integrator
description: Use after a GYTT API contract phase to connect the approved mock-backed web UI to the contract while preserving existing feature structure and localization.
---

# GYTT web integration phase

- Read accepted decisions, the approved UI, the API contract, and the active
  plan.
- Claim one web integration step before editing. Keep the change within the
  planned feature/module area.
- Replace the relevant mock boundary with contract-backed feature data access;
  keep generated code under the configured generated directory and adapt it in
  handwritten feature-owned modules.
- Preserve loading, empty, error, mutation, and retry behavior needed by the
  accepted feature decisions. Keep user-visible text localized.
- Run validation from `apps/web` as required by its `AGENTS.md`, update the
  plan, and hand off to the backend phase with any contract/runtime assumptions.
