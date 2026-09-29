# Product Specification

## Goal / Scope

Provide Polish and English language support throughout the web application, with Polish as the default language.

## Rationale

GYTT is used in a Polish-speaking environment. Polish-first UI copy makes the product immediately usable while English remains available to users who prefer it.

## Current Behaviour (As-Is State)

The web application renders its user-facing interface in English and uses the browser's default locale for date formatting.

## Change Delta

- The web application provides complete Polish and English dictionaries for its current user-facing content, including controls, accessible labels, validation, and error states.
- The initial language is Polish. The user can switch between Polish and English from any route.
- The selected language is saved only in the browser and remains selected on subsequent visits.
- Dates and the document language follow the selected language.
- Task and Habit data, API contracts, and server behavior are unchanged.

## Non-Goals

- Additional languages, automatic browser-language detection, server-side localization, and translated user-authored content.
- Translation of browser-native date-input controls or the browser's HTTP Basic Auth prompt.
