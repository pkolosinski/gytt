# 0009 — Isolate generated web code

Accepted. All generated web artifacts live below `apps/web/src/shared/generated/`.
This supplements ADR 0008 and supersedes its generated-code locations.

## Decision

Generated code is separated from hand-written application code under one
top-level directory:

```text
apps/web/src/shared/generated/
├── openapi/                    # Generated TypeScript API client and schemas
└── shadcn/                     # Generated shadcn artifacts
    ├── ui/
    ├── lib/
    └── hooks/
```

The OpenAPI client generated from `contracts/openapi.yaml` belongs under
`shared/generated/openapi/`. Feature-owned API adapters remain under
`features/<feature>/api/` and wrap the generated client before exposing data
to feature hooks or pages.

shadcn-generated components, utilities, and hooks belong under
`shared/generated/shadcn/`. The shadcn configuration aliases point to these
directories so future generated files are created in the same boundary.

## Tooling boundary

Prettier and oxlint ignore `src/shared/generated/` recursively. Generated
files are not hand-formatted or linted by the web application. Generator
validation remains the responsibility of the generator and its own contract
or template checks.

Generated files must not contain capability policy. Hand-written wrappers,
adapters, and product components belong outside `shared/generated/`.

## Consequences

- All generated artifacts have one predictable, reviewable location.
- Generated formatting or lint rules cannot block hand-written feature work.
- A generated client or shadcn update cannot silently become a hand-written
  shared dependency.
- The generated boundary must be reviewed when a tool introduces a new
  output directory or code-generation step.
