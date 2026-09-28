# Task 16: Calculate per-Habit metrics

**Status:** pending

**Depends on:** Task 15

**Description:** Build and obtain acceptance for per-Habit Completion rate, Target attainment, and null-reason states in the existing details surface using mock data. Then define the metrics OpenAPI operation, generate the client, and connect the accepted surface. Implement bounded range validation, expected-occurrence enumeration, metric policy, and the parameterized `REQUEST_PLUS` adapter last; do not introduce mixed-Habit aggregation.

Implementation subtasks:

1. [ ] Render mock Completion rate and Target attainment/reason states in the existing Habit details surface without mixed-Habit aggregation.
2. [ ] Add component tests for mocked normal, over-target, binary, empty, mixed-unit, and invalid-range states; obtain UI acceptance before defining the API.
3. [ ] Define and verify the metrics OpenAPI operation and regenerate the client.
4. [ ] Connect the accepted metrics details surface to the generated client contract.
5. [ ] Add range validation and expected-occurrence enumeration across definition versions and archive dates, rejecting invalid or over-five-year ranges.
6. [ ] Implement Completion rate from fully met expected occurrences and test three of four as `75%`.
7. [ ] Implement uncapped numeric Target attainment from compatible expected targets and recorded progress and test `145%`.
8. [ ] Add null-reason policy tests for binary targets, no occurrences, and mixed numeric units while retaining Completion rate.
9. [ ] Add the bounded parameterized `REQUEST_PLUS` metrics adapter with hostile bound-value and immediate-read integration coverage.
10. [ ] Add source-owned metrics route and focused validation, storage, and result-shape tests.
11. [ ] Add end-to-end tests proving the accepted metrics UI reflects persisted results.

**Acceptance Criteria:**

- Scenario "Calculate Completion rate" returns `75%` for three completed of four expected occurrences.
- Scenario "Calculate per-Habit target attainment" returns uncapped `145%`.
- Scenario "Avoid a mixed-unit metric" retains Completion rate and returns null Target attainment with `mixedUnits`.
- Binary targets and no-occurrence ranges return their specified reasons.
- Invalid or over-five-year ranges return `422 VALIDATION_FAILED`.
- The metrics UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
