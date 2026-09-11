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
- Preserve keyboard access and meaningful semantics. The website must be
  responsive and work well on both desktop and mobile devices.
- Keep browser concerns at this boundary; capability rules belong in `core/`
  or behind the server API.

## shadcn/ui skill

- Follow the local [shadcn skill](.agents/skills/shadcn/SKILL.md) and its linked
  rules for shadcn/ui work. It covers component discovery, installation,
  updates, composition, styling, forms, icons, chat, registries, theming, and
  CLI usage.
- Use existing shadcn components before custom markup. Search configured
  registries and run `pnpm dlx shadcn@latest docs <component>` before creating,
  fixing, or debugging a component; use `pnpm dlx shadcn@latest info` to check
  the current project configuration.
- Run shadcn commands from `apps/web` with pnpm. Use `--dry-run` and `--diff`
  before updates, never manually decode preset codes or fetch raw component
  files, and never use `--overwrite` without explicit approval.
- Keep generated shadcn files under `src/shared/generated/shadcn/` untouched;
  use the configured aliases, icon library, semantic tokens and variants, and
  the skill's accessibility and composition rules instead.
