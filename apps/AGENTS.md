# Application boundaries

This guidance applies to deployable code under `apps/`.

- Follow the repository's UI feature sequence in `docs/agent-guidance/feature-workflow.md`.
- Applications may depend on `core`; `core` must not depend on applications.
- Keep framework, transport, persistence, configuration, and other I/O at the
  application boundary.
- Do not duplicate domain or capability rules in an app when they belong in a
  core facade.
