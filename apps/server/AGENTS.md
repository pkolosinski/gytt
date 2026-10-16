# Server application

- Follow [Kotlin conventions](../../docs/agent-guidance/kotlin.md).
- The app uses Ktor; keep each server feature in its own Ktor module.
- Translate core `Either` results into explicit HTTP responses. Do not use exceptions for expected
  domain or request failures.
- Validate changes with `./gradlew :apps:server:ktlint` and `./gradlew :apps:server:test` from the
  repository root.
