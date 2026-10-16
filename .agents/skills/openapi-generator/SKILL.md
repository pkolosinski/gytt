---
name: openapi-generator
description: Use after UI confirmation when a GYTT feature needs a new or changed API contract. Keep the contract limited to accepted behavior and update generated inputs rather than generated output.
---

# GYTT API contract phase

- Read the accepted decisions, approved UI result, and active plan.
- Claim a contract step before editing. Keep the contract small and limited to
  behavior already agreed with the user.
- Use `contracts/openapi.yaml` as the canonical HTTP contract. If it is not
  present yet, add it for the accepted feature; ask before adding a new
  generator or dependency.
- Update generator inputs and regenerate artifacts only through the established
  project process; never hand-edit generated output.
- Verify contract/generation checks available in the repository, update the
  plan, and leave a concise handoff for web integration.
