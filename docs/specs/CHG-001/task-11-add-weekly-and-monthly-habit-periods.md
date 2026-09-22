# Task 11: Add weekly and monthly Habit periods

**Status:** pending

**Depends on:** Task 10

**Description:** Create one occurrence per Monday-based ISO week or calendar month, default each Habit module to the current device period, navigate exact past/future period routes, and keep weekly/monthly occurrences out of Tasks. Add canonical ISO week and YearMonth keys, weekly/monthly schedule applicability, deterministic occurrence identities, period parsing, OpenAPI schemas, keyed/default routes, navigation, and empty-period UI. Reuse binary progress and the Completed section from the day slice.

**Acceptance Criteria:**

- Scenarios "Default Habit routes to current periods", "Navigate Habit periods", and "Use Monday weeks and calendar months" pass.
- Scenario "Project only day-based Habit tasks" includes daily/due selected-day occurrences and excludes weekly/monthly ones.
- Malformed or impossible calendar routes show the not-found state instead of normalization.
- Weekly and monthly progress uses the same absolute, deterministic period-key storage path.
