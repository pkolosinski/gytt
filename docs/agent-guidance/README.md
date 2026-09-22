# Agent guidance

These documents contain repository-wide guidance that is useful after the
minimal root `AGENTS.md`. Path-specific constraints remain in the nested
`AGENTS.md` files linked from the root.

## Suggested documentation structure

```text
docs/
├── agent-guidance/
│   ├── README.md
│   ├── architecture.md
│   ├── feature-workflow.md
│   ├── repository-structure.md
│   └── validation.md
├── adr/
│   └── NNNN-short-decision-title.md
├── specs/
│   └── <change>/
│       ├── product.md
│       ├── tech.md
│       ├── plan.md
│       └── task-NN-short-title.md
├── operations.md
└── operator-acceptance.md
```

- Use `specs/<change>/` for one bounded product or behavior change.
- Use `adr/` for durable architectural, module-boundary, or deployment
  decisions.
- Keep operational runbooks and acceptance records at the `docs/` level.
