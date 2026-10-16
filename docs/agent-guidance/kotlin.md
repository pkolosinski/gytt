# Kotlin conventions

- Prefer clear data transformations and immutable domain values. Local mutation is fine when it makes
  an algorithm simpler and the mutable state does not escape the function.
- Use the Kotlin style enforced by ktlint; do not add formatting exceptions
  without an explicit need.
- Always ask before adding any new dependency.
