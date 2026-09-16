# GYTT

GYTT is a private, single-user, local-first life-organization product for daily tasks and habit consistency.

## Required for every task

- Read and apply the nearest nested `AGENTS.md`; nested guidance adds to this
  file.
- Preserve the local-only product boundary and the module boundaries described by the specifications.
- Do not commit secrets or modify generated or ignored output unless the task explicitly requires it.

## Tooling and validation

- Kotlin/JVM uses the Gradle wrapper (`./gradlew`); run affected `test` and `ktlintCheck` tasks.
- The web app uses `pnpm` from `apps/web` rather than npm; run `pnpm build` and `pnpm lint` there.
- For feature or behavior work, read the relevant `docs/specs/<change>/product.md`, `tech.md`, and `plan.md` before coding, then keep the plan status current.

## Detailed guidance

- [Repository structure](docs/agent-guidance/repository-structure.md)
- [Architecture and API design](docs/agent-guidance/architecture.md)
- [Feature and documentation workflow](docs/agent-guidance/feature-workflow.md)
- [Validation](docs/agent-guidance/validation.md)

## Path-specific guidance

- [Applications](apps/AGENTS.md)
- [Server application](apps/server/AGENTS.md)
- [Web application](apps/web/AGENTS.md)
- [Core capability modules](core/AGENTS.md)
- [Gradle build logic](build-logic/AGENTS.md)
- [Project documentation](docs/AGENTS.md)
- [Architecture decision records](docs/adr/AGENTS.md)
- [Change specifications](docs/specs/AGENTS.md)
