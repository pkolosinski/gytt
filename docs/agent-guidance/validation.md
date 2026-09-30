# Validation

- For Kotlin changes, run the affected Gradle `test` and `ktlintCheck` tasks
  through `./gradlew`.
- Test core capabilities through their public facades with mocked or in-memory
  dependencies, verifying the complete flow. Core modules do not need
  integration tests; add implementation-level unit tests only for complex
  logic, edge cases, or other special cases.
- For web changes, run `pnpm build` and `pnpm lint` from `apps/web`.
- For server, core, or build-logic changes, include the affected module's
  Gradle configuration, test, and ktlint tasks.
- Documentation-only changes do not need a build unless a documentation check
  specifically covers them.
