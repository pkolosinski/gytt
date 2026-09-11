# Task 22: Prove bounded query performance

**Status:** pending

**Depends on:** Task 16, Task 17, Task 19

**Description:** Keep each source-owned Dashboard request and one date/period query within the specified 500 ms p95 bound on the home-LAN test profile while using `REQUEST_PLUS`, 10,000 Tasks, 100 Habits, and five years of progress. Add deterministic local scale fixtures, warm-up and measured query runs, percentile reporting, and bounded metrics-range coverage. Tune only the specified filtered secondary indexes and bounded read models; do not add projections, a Dashboard module, primary indexes, or remote infrastructure. If an index must change after the initial migration has been recorded, add a new checksum-verified forward migration with image schema-range and backup/restore compatibility tests; never edit an applied migration.

Implementation subtasks:

1. [ ] Add deterministic local fixtures for 10,000 Tasks, 100 Habits, and five years of progress without remote infrastructure.
2. [ ] Add a repeatable warm-up/measured harness that records per-query latency and p95 under `REQUEST_PLUS`.
3. [ ] Measure and record the Task summary and Habit summary independently against the required profile.
4. [ ] Measure and record one Task board and one Habit period query and verify neither fetches all history.
5. [ ] Measure and record allowed five-year metrics queries and verify larger ranges return `422` before database work.
6. [ ] If a query misses the bound, tune only its bounded read model or specified filtered secondary indexes and rerun that measurement.
7. [ ] If an index change is required after the initial migration, add a new checksum-verified forward migration plus schema-range and backup/restore compatibility tests.
8. [ ] Verify the final schema has no primary index, all five query families meet the recorded 500 ms p95 objective, and the report includes fixture and run parameters.

**Acceptance Criteria:**

- Task summary, Habit summary, Task board, Habit period, and allowed metrics queries meet the recorded p95 objective with `REQUEST_PLUS`.
- The SPA-facing queries do not fetch all history for a card or single period.
- Metrics beyond five years return `422` rather than performing unbounded work.
- Any required index remains part of the checksum-verified forward migration and no primary index is introduced.
