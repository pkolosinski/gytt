# Core domain modules

## Repository structure

```text
core/
├── habit/       Habit domain
├── task/        Task domain
└── persistence/ Shared persistence abstractions
```

## Rules

- Follow [Kotlin conventions](../docs/agent-guidance/kotlin.md).
- `core/` is an aggregator: its only purpose is to export submodules, it doesn't contain any code
  itself.
- Core may orchestrate capability behavior through narrow, injected ports. Keep concrete I/O,
  persistence implementations, frameworks, transport, and infrastructure in `apps/`; core must not
  depend on them.
- Each submodule owns one capability.
- Keep implementation declarations `internal` by default and expose one intentional public facade
  per submodule.
- Use Arrow `Either` consistently for expected domain failures; reserve exceptions for exceptional
  technical failures.
- Introduce domain-specific value or sealed types when they prevent realistic mistakes or express
  meaningful invariants. Avoid wrapping primitives mechanically.
- Prefer ordinary, readable Kotlin. Avoid custom abstractions, DSLs, or advanced FP patterns unless
  they simplify real repeated code.
- Core modules do not need integration tests. Test each capability primarily through its public
  facade using in-memory port implementations where effects are involved, and verify the complete
  flow.
- Add unit tests for internal implementation details only when they cover complex logic, edge cases,
  or other special cases that are not adequately covered through the facade.
- Validate changes with `./gradlew :core:{module}:ktlint` and `./gradlew :core:{module}:test` from
  the repository root.
