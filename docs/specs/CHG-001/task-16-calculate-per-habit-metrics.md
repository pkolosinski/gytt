# Task 16: Calculate per-Habit metrics


**Status:** pending

**Depends on:** Task 15

**Description:**


**Behaviour:** Report Completion rate over expected occurrences and uncapped Target attainment for one numeric Habit, while returning the specified null reason when target attainment is not meaningful.

**Implementation action:** Enumerate expected occurrences across immutable definitions and archive dates, count fully met targets, sum compatible numeric progress/targets, preserve units, cap the range at five years, and use a bounded parameterized `REQUEST_PLUS` query. Add hostile bound-value integration coverage with this first metrics query. Render the metrics in the existing details surface without introducing mixed-Habit aggregation.

**Verification command:** `./gradlew :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run MetricSummary`

**Acceptance Criteria:**

- Scenario "Calculate Completion rate" returns `75%` for three completed of four expected occurrences.
- Scenario "Calculate per-Habit target attainment" returns uncapped `145%`.
- Scenario "Avoid a mixed-unit metric" retains Completion rate and returns null Target attainment with `mixedUnits`.
- Binary targets and no-occurrence ranges return their specified reasons.
- Invalid or over-five-year ranges return `422 VALIDATION_FAILED`.
