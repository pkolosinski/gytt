# GYTT

GYTT is a private, single-user, local-first life-organization product for daily tasks and habit
consistency.

## Ground rules

- Preserve GYTT's private, local-first product boundary.
-
-

## Project context

- See [`docs/product.md`](docs/product.md) for product intent and boundaries.
- See [`docs/technology.md`](docs/technology.md) for the current stack and roadmap.
- See [`docs/decisions/`](docs/decisions/) for accepted durable decisions.

## Repository structure

- `apps/` contains deployable applications: `server/` and `web/`.
- `core/` contains capability modules such as `habit/`, `task/`, and shared
  persistence code.
- `build-logic/` contains Gradle convention plugins and build configuration.
- `docs/` contains concise product and technology context and durable decisions.

## Detailed guidance

- [Kotlin conventions](docs/agent-guidance/kotlin.md)
- [React and TypeScript conventions](docs/agent-guidance/react.md)
