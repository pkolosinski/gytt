# Gradle build logic

- This directory contains Gradle convention plugins and build configuration
  only; do not put application or domain code here.
- Keep module build files thin by centralizing shared Kotlin/JVM, testing, and
  ktlint conventions in the appropriate convention plugin.
- Preserve the version catalog and plugin-management approach unless the
  change explicitly requires a build-system decision.
