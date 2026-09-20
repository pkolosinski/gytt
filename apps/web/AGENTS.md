# Web application

- Keep TypeScript strict; do not weaken types or use casts to bypass errors.
- Prefer `type` declarations; use `interface` for component props.
- Do not use default exports; use named exports.
- Keep React components focused and separate UI composition from data access.
- Do not create component-specific CSS files or stylesheets. Use shadcn
  components whenever possible; when no fitting shadcn component exists, use
  Tailwind utility classes for the component instead.
- Never modify generated files. Keep all generated web code under
  `src/shared/generated/` and update generator inputs instead.
- Reuse existing styles and local assets. Do not introduce remotely hosted
  runtime assets.
- Preserve keyboard access, meaningful semantics, and responsive behavior.
- Keep browser concerns at this boundary; capability rules belong in `core/`
  or behind the server API.
