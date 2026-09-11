# Core capability modules

- `core/` is an aggregator: it contains module coordination, not production
  capability code.
- Each submodule owns one capability; keep `habits` and `tasks` separate.
- Core code must remain pure Kotlin/JVM plus Arrow. Do not add frameworks,
  I/O, persistence, transport, or infrastructure dependencies here.
- Model expected failures with Arrow `Either`; do not throw for ordinary
  domain failures.
- Keep implementation declarations `internal` by default and expose one
  intentional public facade per submodule.
- Test each capability primarily through its public facade using mocked or
  in-memory dependencies, and verify the complete flow.
- Core modules do not need integration tests. Add unit tests for internal
  implementation details only when they cover complex logic, edge cases, or
  other special cases that are not adequately covered through the facade.
- Keep tests beside the capability they exercise.
