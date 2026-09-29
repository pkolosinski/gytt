# Tech spec — CHG-002

## Current State (required)

- The React/TypeScript SPA has static English copy in Dashboard, Tasks, shared components, and page accessibility labels.
- Date formatting uses the browser default locale.
- The web app has no localization dependency or locale preference.

## Architecture Delta (required)

- Implement localization at the web application boundary in `apps/web/src/shared/i18n/`.
- Use typed, local TypeScript dictionaries for Polish and English and a React context to expose the selected language and translation function.
- Keep the language preference in browser `localStorage`; default to Polish when no valid preference is saved.
- Add a language selector to the shared application frame and synchronize the selected language with `<html lang>`.
- Pass the selected locale to local date formatting. Keep domain dates and all API/domain behavior unchanged.
- Add no runtime dependency, network request, or server/API localization behavior.

## Architecture Decisions

- The supported language identifiers are `pl` and `en`; their formatting locales are `pl-PL` and `en-US`.
- Unknown or unavailable stored language values fall back to Polish.
- Translations include visible text, accessible names/statuses, validation and error messages, and route placeholder copy.

## Backend

No backend or API changes.

### Operations

None.

### Events

None.

## Frontend

### Screens and routes

All existing routes use the selected dictionary; the shared language selector is available on every route.

### Components

Add a locale provider, translation hook, dictionaries, and accessible language selector. Update existing components to use translation keys rather than embedded UI strings.

### States

The language selector reflects the current language. Changing it updates rendered copy, date formatting, and the document language immediately and persists the choice locally.

### Design

Retain the existing responsive page layouts and styles. Ensure the language selector remains usable on narrow screens and by keyboard.

## Dependencies

No new dependencies.

## Data

Persist only the `pl` or `en` language preference in browser `localStorage`. No product data schema changes.

## Non-Functional Requirements (required)

- Translation selection is local-only and makes no network requests.
- The UI remains responsive and semantically accessible in both languages.
- Do not modify generated files.

## Deployment and Configuration

No deployment or configuration changes.

## Threat Model (required)

Treat the stored language value as untrusted input; accept only supported language identifiers and otherwise use Polish. No user content is interpreted as markup.

## Behaviour Scenarios (required)

```gherkin
Scenario: Start in Polish by default
  Given no supported language preference is stored
  When the web application loads
  Then all interface text and date formatting use Polish and the document language is pl

Scenario: Select English
  Given the application is using Polish
  When the user selects English
  Then interface text and date formatting use English, the document language is en, and the choice is saved locally

Scenario: Restore a supported preference
  Given English is saved locally
  When the user opens or reloads any application route
  Then the English interface is rendered

Scenario: Ignore an unsupported preference
  Given an unsupported language value is saved locally
  When the application loads
  Then Polish is used
```

## Test Strategy (required)

Use Vitest and Testing Library for default locale, language switching, persisted preference, localized dates, translated route content, and existing functionality. Run `pnpm test`, `pnpm build`, and `pnpm lint` from `apps/web`.

## Recovery and Rollback (required)

The change is isolated to frontend presentation and local preference state. Reverting the frontend change restores the current English-only interface; no persisted product data migration or backend rollback is needed.

## Open Questions

None.
