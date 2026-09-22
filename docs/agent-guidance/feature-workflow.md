# Feature and documentation workflow

- Treat project documentation as the source of truth for product behavior,
  architecture, operations, and delivery constraints.
- For feature or behavior changes, read the relevant
  `docs/specs/<change>/product.md`, `tech.md`, and the `plan.md` task index
  before coding.
- Implement the current task files and keep their statuses current using the
  `pending`, `in progress`, and `done`.
- Keep one change under `docs/specs/<change>/`; use its product, tech, plan
  index, and one file per task.
- Keep task files small, explicit, and dependency-aware. Each task contains
  only its title, status, dependencies, description of required work, and
  acceptance criteria; keep the plan index limited to task links, statuses,
  and dependencies.
- Update related documentation when behavior, boundaries, deployment, or
  acceptance criteria change.
- Use the templates for new product, technical, and plan documents.
- Put project-specific architectural decisions in the relevant change or ADR.
- Use an ADR for a durable architectural, module-boundary, or deployment
  decision. Preserve the existing numbered filename and structure, and do not
  rewrite accepted ADRs as later implementation notes.
- Keep change-specific follow-ups in the same change directory rather than
  broadening unrelated documentation.
