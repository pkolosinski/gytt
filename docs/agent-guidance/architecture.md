# Architecture and API design

- Keep capability rules in `core/` and expose a small intentional public
  facade from each capability module.
- Keep implementation declarations private to their owning module by default.
- Keep core code pure Kotlin/JVM plus Arrow; do not add frameworks, I/O,
  persistence, transport, or infrastructure dependencies there.
- Prefer functional composition for capability behavior and model expected
  failures with Arrow `Either`; do not throw for ordinary domain failures.
- Use Ktor as the server delivery boundary. Keep each server feature in its
  own Ktor application module, keep the root application module focused on
  composition, and translate core `Either` results into explicit HTTP
  responses.
- Do not duplicate domain or capability rules in an application when they
  belong behind a core facade.
- Keep build configuration in `build-logic/` and centralize shared Kotlin/JVM,
  testing, and ktlint conventions in the appropriate convention plugin.
- Preserve the version catalog and plugin-management approach unless a
  task-specific build-system decision requires changing them.
