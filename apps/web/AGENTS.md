# Web application

## Repository structure

```text
apps/web/
├── public/       Static files
├── src/
│   ├── app/      App setup, routing, providers, and layout
│   ├── assets/   Images and other imported assets
│   ├── features/ Product capabilities and their behavior
│   ├── pages/    Route-level composition
│   ├── shared/   Reusable, capability-neutral code
│   ├── styles/   Global styles
│   └── test/     Shared test setup and utilities
└── config files  Package, TypeScript, and Vite configuration
```

## Rules

- Follow [React and TypeScript conventions](../../docs/agent-guidance/react.md).
- Keep route state that should survive navigation or be linkable in the URL; use local React state
  for transient UI state and TanStack Query for server state. Lift local state to the nearest common
  owner; don't add global state or context just to avoid modest prop passing.
- Keep route composition in `pages/` and capability behavior, UI, models, and data access in
  `features/<capability>/`. Put code in `shared/` only when it is genuinely capability-neutral.
- Parse and validate user-controlled or browser-provided values at their ingress points, such as
  route parameters, form input, and local storage. Rely on generated API types for ordinary API
  flows.
- Colocate tests with the page, feature, or helper they cover; keep shared test setup in
  `src/test/`.
- Prefer existing shadcn components; use Tailwind utility classes when no suitable component exists.
  Do not create component-specific stylesheets.
- Never modify generated files; keep generated web code under `src/shared/generated/` and update
  generator inputs instead.
- Reuse existing styles and local assets. Do not introduce remotely hosted runtime assets.
- Preserve meaningful semantics and keyboard access.
- The website must be responsive and work well on both desktop and mobile devices.
- Keep browser concerns at this boundary; capability rules belong in `core/` or behind the server
  API.
- Put every user-facing string in the locale dictionaries and render it with `useTranslation`; add
  each key to every language.
- Validate web changes by running `pnpm format` and `pnpm lint` from this directory; run `pnpm test`
  for affected behavior; don't run `pnpm build` after every change, only once whole feature is
  implemented.
