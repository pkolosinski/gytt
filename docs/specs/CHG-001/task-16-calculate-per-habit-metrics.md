# Task 16: Calculate per-Habit metrics

**Status:** pending

**Depends on:** Task 15

**Description:** Report Completion rate over expected occurrences and uncapped Target attainment for one numeric Habit, while returning the specified null reason when target attainment is not meaningful. Enumerate expected occurrences across immutable definitions and archive dates, count fully met targets, sum compatible numeric progress/targets, preserve units, cap the range at five years, and use a bounded parameterized `REQUEST_PLUS` query. Add hostile bound-value integration coverage with this first metrics query. Render the metrics in the existing details surface without introducing mixed-Habit aggregation.

Implementation subtasks:

1. [ ] Add range validation and expected-occurrence enumeration across definition versions and archive dates, rejecting invalid or over-five-year ranges.
2. [ ] Implement Completion rate from fully met expected occurrences and test three of four as `75%`.
3. [ ] Implement uncapped numeric Target attainment from compatible expected targets and recorded progress and test `145%`.
4. [ ] Add reason policy tests for binary targets, no occurrences, and mixed numeric units while retaining Completion rate.
5. [ ] Add the bounded parameterized `REQUEST_PLUS` metrics adapter with hostile bound-value and immediate-read integration coverage.
6. [ ] Add the metrics HTTP/OpenAPI/client operation with focused validation, storage, and result-shape tests.
7. [ ] Render Completion rate and Target attainment/reason in the existing Habit details surface without adding mixed-Habit aggregation.
8. [ ] Add component tests for normal, over-target, binary, empty, mixed-unit, and invalid-range states.

**Acceptance Criteria:**

- Scenario "Calculate Completion rate" returns `75%` for three completed of four expected occurrences.
- Scenario "Calculate per-Habit target attainment" returns uncapped `145%`.
- Scenario "Avoid a mixed-unit metric" retains Completion rate and returns null Target attainment with `mixedUnits`.
- Binary targets and no-occurrence ranges return their specified reasons.
- Invalid or over-five-year ranges return `422 VALIDATION_FAILED`.
