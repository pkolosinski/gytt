# Server application

- Use Ktor as the delivery boundary and keep each server feature in its own
  Ktor application module.
- Keep the root application module focused on composing feature modules.
- Call capabilities through their public core facades; never depend on
  implementation declarations.
- Translate core `Either` results into explicit HTTP responses. Do not use
  exceptions for expected domain or request failures.
- Keep HTTP, serialization, infrastructure, configuration, and persistence
  code here rather than in `core/`.
