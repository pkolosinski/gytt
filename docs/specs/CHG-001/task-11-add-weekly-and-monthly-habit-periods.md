# Task 11: Add weekly and monthly Habit periods

**Status:** pending

**Depends on:** Task 10

**Description:** Build and obtain acceptance for weekly/monthly Habit period pages using mock data: current-period defaults, exact period navigation, empty states, and progress/history presentation. Then define OpenAPI period/schedule schemas, generate the client, and connect period routes and controls. Implement canonical keys, schedule applicability, deterministic occurrences, persistence, and query behavior last, preserving day-based-only inclusion in Tasks and reusing binary progress and the Completed section.

Implementation subtasks:

1. [ ] Build weekly/monthly period pages, empty states, period navigation, and progress/history presentation with mock data.
2. [ ] Add mocked component tests for current-period defaults, exact navigation, Monday/month boundaries, and malformed routes; obtain UI acceptance before defining the contract.
3. [ ] Define and verify OpenAPI period/schedule schemas and regenerate the client.
4. [ ] Connect accepted period routes and navigation to the generated client contract.
5. [ ] Define canonical Monday-based ISO week and YearMonth values with parsing/navigation and impossible-value policy tests.
6. [ ] Add weekly and monthly schedule applicability and deterministic occurrence identity tests.
7. [ ] Extend persistence and progress keys for weekly/monthly occurrences through the existing absolute-progress path.
8. [ ] Extend period query adapters and prove daily/due selected-day occurrences remain in Tasks while weekly/monthly occurrences are excluded.
9. [ ] Implement default day/week/month route replacement and exact keyed backward/forward navigation with not-found behavior for malformed/impossible values.
10. [ ] Add backend and end-to-end tests for progress round trips and Tasks exclusion; Dashboard summaries remain deferred to Tasks 17/24.

**Acceptance Criteria:**

- Scenarios "Default Habit routes to current periods", "Navigate Habit periods", and "Use Monday weeks and calendar months" pass.
- Scenario "Project only day-based Habit tasks" includes daily/due selected-day occurrences and excludes weekly/monthly ones.
- Malformed or impossible calendar routes show the not-found state instead of normalization.
- Weekly and monthly progress uses the same absolute, deterministic period-key storage path.
- The weekly/monthly UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
