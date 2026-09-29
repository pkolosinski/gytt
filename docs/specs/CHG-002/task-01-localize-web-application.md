# Task 1: Localize the web application in Polish and English

**Status:** done

**Depends on:** None

**Description:** Add local Polish and English dictionaries, default to Polish, allow a user to change and locally persist the language across routes, and localize current interface copy, accessibility text, validation, errors, date formatting, and document language.

Implementation subtasks:

1. [x] Add the typed localization provider, dictionaries, persistence, and shared language selector.
2. [x] Replace user-facing strings and browser-locale date formatting with selected-language translations.
3. [x] Add tests for Polish default, English selection and persistence, and translated views.
4. [x] Run the web test, build, and lint commands and complete validation.

**Acceptance Criteria:**

- With no saved language, every current application route renders in Polish and the document language is `pl`.
- The user can switch to English from every route; all supported interface and accessible text and date formatting update accordingly.
- The language choice persists locally across reloads; invalid stored values fall back to Polish.
- User-authored Task content, domain behavior, and API contracts are unchanged.
- The web test suite, build, and lint pass.
