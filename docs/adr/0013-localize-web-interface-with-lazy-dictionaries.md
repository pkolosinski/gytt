# 0013 — Localize the web interface with lazily loaded dictionaries

Accepted. The web application translates its interface with `i18next` and
`react-i18next`, keeping one dictionary per language and downloading only the
active one. This supplements ADR 0008.

## Decision

Localization is capability-neutral infrastructure under `shared/i18n/`:

```text
apps/web/src/shared/i18n/
├── i18n.ts          # Instance bootstrap, lazy dictionary loading, useLanguage
├── i18next.d.ts     # Types `t` keys from the English dictionary
├── languages.ts     # Supported languages, native names, browser detection
└── locales/
    ├── en.ts        # Source dictionary; defines the `Dictionary` type
    └── pl.ts        # Typed as `Dictionary`
```

- Each language is one TypeScript dictionary module. The English dictionary
  defines the `Dictionary` shape; every other dictionary is typed as
  `Dictionary`, so a missing or extra key fails type-checking.
- Dictionaries are loaded through dynamic `import()` with
  `i18next-resources-to-backend`, so each is a separate bundle chunk. No
  fallback language is configured, so only the active dictionary is
  downloaded; another one is fetched only when the user switches to it.
- The application renders after the active dictionary loads, so untranslated
  text never flashes.
- The initial language is the first supported language in the browser's
  preference list, matched by primary subtag, falling back to English. The
  choice is not persisted yet; the sidebar Preferences group offers a
  language select next to the theme switch.
- The `<html lang>` attribute follows the active language, and dates are
  formatted with `Intl` for the active language.
- Components translate with `useTranslation`. Helpers that produce
  user-facing text receive `t` as a parameter instead of reading a global.
- Messages supplied by the server, such as validation or domain error
  details, and user content are displayed as received and are not translated
  by the web application.

## Consequences

- Adding a language adds one dictionary module, one loader entry, and one
  supported-language entry; the compiler lists every untranslated key.
- Initial page load cost grows only by the active dictionary.
- Tests initialize English in the Vitest setup file and assert English copy.
- Persisting the chosen language, or localizing server messages, needs a
  follow-up decision.
