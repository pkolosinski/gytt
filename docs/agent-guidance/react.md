# React and TypeScript conventions

- Keep TypeScript strict; do not weaken compiler options to get around type errors.
- Prefer `type` aliases. Use `interface` when extension or declaration merging is useful.
- Use named exports rather than default exports.
- Keep component render logic focused. Extract components or custom Hooks when they clarify intent,
  enable meaningful reuse, or isolate stateful behavior; avoid extracting every small JSX fragment.
- Keep state minimal: store values that change independently, and derive values from props/state
  during render rather than duplicating them in state.
- Use Effects to synchronize with external systems. Handle interaction-driven work in event handlers,
  and avoid Effects for derived data or state that can be computed during render.
- Use manual memoization (`memo`, `useMemo`, `useCallback`) when it is likely to prevent meaningful
  work or provide identity stability needed by an API; avoid applying it mechanically.
- Type assertions, non-null assertions, and `any` are case-by-case tools. Prefer explicit types,
  narrowing, and validation when they make the code safer or clearer.

## Testing

- Keep pure helpers free of side effects and test every meaningful branch, outcome, and relevant
  boundary case.
- For UI, test user-visible behavior rather than component internals. Add tests for meaningful
  interaction logic, such as opening a modal or moving a task and observing the resulting behavior;
  tests are not required for every component or feature.
- Prefer accessible queries such as roles and labels, and use `user-event` for interactions. Use async
  queries when the expected UI appears asynchronously.
- Test custom Hooks in isolation only when they are genuinely reusable or library-like; otherwise,
  test through the UI that uses them.
