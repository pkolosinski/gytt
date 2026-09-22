# Task 22: Prove bounded query performance


**Status:** pending

**Depends on:** Task 16, Task 17, Task 19

**Description:**


**Behaviour:** Keep each source-owned Dashboard request and one date/period query within the specified 500 ms p95 bound on the home-LAN test profile while using `REQUEST_PLUS`, 10,000 Tasks, 100 Habits, and five years of progress.

**Implementation action:** Add deterministic local scale fixtures, warm-up and measured query runs, percentile reporting, and bounded metrics-range coverage. Tune only the specified filtered secondary indexes and bounded read models; do not add projections, a Dashboard module, primary indexes, or remote infrastructure. If an index must change after the initial migration has been recorded, add a new checksum-verified forward migration with image schema-range and backup/restore compatibility tests; never edit an applied migration.

**Verification command:** `./gradlew :apps:server:integrationTest --tests 'gytt.server.couchbase.PerformanceIndexMigrationTest' :apps:server:performanceTest`

**Acceptance Criteria:**

- Task summary, Habit summary, Task board, Habit period, and allowed metrics queries meet the recorded p95 objective with `REQUEST_PLUS`.
- The SPA-facing queries do not fetch all history for a card or single period.
- Metrics beyond five years return `422` rather than performing unbounded work.
- Any required index remains part of the checksum-verified forward migration and no primary index is introduced.
