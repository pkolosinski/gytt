# 0012 — Use module-scoped web data access with TanStack Query

Accepted. Web features reach server data through directly imported API modules
and TanStack Query options, not through React context providers. This
supplements ADR 0008.

## Decision

Each feature keeps its data access in three layers:

- `features/<feature>/api/<feature>-api.ts` exports a module-scoped API object
  with plain async operations. It maps wire data to feature models and errors
  to feature error types, and has no React dependency.
- `features/<feature>/api/<feature>-query-options.ts` exports hierarchical
  query keys and `queryOptions` factories that call the API object. The same
  options serve hooks, prefetching, and direct cache access.
- `features/<feature>/hooks/` wraps the options in thin `useQuery` hooks and
  owns mutations and their cache invalidation. Components use only these
  hooks.

`app/providers/` mounts a single `QueryClientProvider`. Its client defines
application-wide query defaults, including retrying only transient failures.
Features do not add their own providers for data access.

## Consequences

- Adding a feature adds files, not another provider around the application.
- TanStack Query is the single owner of server state; no separate global store
  is introduced for server data.
- Replacing a feature's backing implementation, such as moving from in-memory
  sample data to the generated OpenAPI client, changes only its API module.
- Tests replace API operations with module mocks or spies instead of wrapping
  the tree in feature providers, and restore them after each test.
