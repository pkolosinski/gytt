# Task 11: Add weekly and monthly Habit periods

**Status:** pending

**Depends on:** Task 10

**Description:** Create one occurrence per Monday-based ISO week or calendar month, default each Habit module to the current device period, navigate exact past/future period routes, and keep weekly/monthly occurrences out of Tasks. Add canonical ISO week and YearMonth keys, weekly/monthly schedule applicability, deterministic occurrence identities, period parsing, OpenAPI schemas, keyed/default routes, navigation, and empty-period UI. Reuse binary progress and the Completed section from the day slice.

Implementation subtasks:

1. [ ] Define canonical Monday-based ISO week and calendar YearMonth value objects with parsing, navigation, and impossible-value tests.
2. [ ] Add weekly schedule applicability and deterministic one-occurrence-per-week identity tests.
3. [ ] Add monthly schedule applicability and deterministic one-occurrence-per-month identity tests.
4. [ ] Extend persistence, progress keys, and OpenAPI period/schedule unions for weekly and monthly occurrences through the existing absolute-progress path.
5. [ ] Extend period query adapters and prove daily/due selected-day occurrences remain in Tasks while weekly/monthly occurrences are excluded.
6. [ ] Implement default day/week/month route replacement from device LocalDate and exact keyed backward/forward navigation.
7. [ ] Add malformed/impossible route not-found states and period-specific empty UI without silent normalization.
8. [ ] Add component and integration tests for default periods, exact navigation, Monday/calendar boundaries, progress round trips, and Tasks exclusion.

**Acceptance Criteria:**

- Scenarios "Default Habit routes to current periods", "Navigate Habit periods", and "Use Monday weeks and calendar months" pass.
- Scenario "Project only day-based Habit tasks" includes daily/due selected-day occurrences and excludes weekly/monthly ones.
- Malformed or impossible calendar routes show the not-found state instead of normalization.
- Weekly and monthly progress uses the same absolute, deterministic period-key storage path.
