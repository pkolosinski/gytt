# 0008 — Use a feature-first web application structure

Accepted. The web application separates route composition, capability code,
and capability-neutral infrastructure while keeping each feature internally
cohesive.

## Decision

The web source tree uses four boundaries:

- `app/` owns application bootstrap, providers, router composition, and the
  top-level application component.
- `pages/` owns route-level composition. Pages connect feature hooks and
  components but do not contain reusable feature implementations.
- `features/` owns product capabilities. Each feature keeps its API adapters,
  components, hooks, models, and helpers together.
- `shared/` owns code that is not specific to Tasks, Habits, or another
  capability.

The intended layout is:

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
├── pages/
│   ├── dashboard/
│   ├── tasks/
│   └── habits/
├── features/
│   ├── dashboard/
│   ├── tasks/
│   └── habits/
└── shared/
    ├── ui/
    ├── components/
    ├── hooks/
    ├── api/
    │   ├── generated/
    │   ├── http-client.ts
    │   └── problem-details.ts
    ├── lib/
    └── types/
```

Feature directories use this internal structure where applicable:

```text
features/<feature>/
├── api/
├── components/
├── hooks/
├── models/
├── helpers/
└── index.ts
```

The dependency direction is:

```text
app -> pages -> features
features -> shared
shared -> no features
```

Pages may compose more than one feature when the screen is intentionally
cross-capability, such as the Dashboard or the Tasks board's Habit progress
action. Feature internals are not imported across feature boundaries; a
feature's `index.ts` is its public surface.

## Generated code and shared code

The OpenAPI client generated from `contracts/openapi.yaml` is placed under
`shared/api/generated/`. It is transport infrastructure for the complete
contract and is not imported directly by pages or UI components. Feature-owned
files under `features/<feature>/api/` wrap the generated client, map wire
schemas to feature models, and expose operations to feature hooks.

shadcn-generated primitives are placed under `shared/ui/`. Capability-neutral
composed UI belongs under `shared/components/`, browser-only reusable hooks
under `shared/hooks/`, and generic helpers under `shared/lib/`. Shared modules
must not contain Task or Habit policy.

## Consequences

- Tasks and Habits remain visibly separated without duplicating transport or
  UI infrastructure.
- Pages stay focused on route composition and do not become a second service
  or global state layer.
- Generated code has stable locations and is not hand-edited as part of
  feature work.
- The current web scaffold needs a small migration when a feature is added,
  but the layout scales without a global `components`, `hooks`, or `services`
  directory that mixes capabilities.
