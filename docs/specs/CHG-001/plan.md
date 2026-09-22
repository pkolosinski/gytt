# Implementation plan index

Each task is maintained in its own file so its status and execution details can be updated independently.

| Number | Task | Status | Dependencies |
| ---: | --- | --- | --- |
| 1 | [Bootstrap the local application shell](task-01-bootstrap-the-local-application-shell.md) | in progress | None |
| 2 | [Provision Couchbase and schema readiness](task-02-provision-couchbase-and-schema-readiness.md) | pending | [Task 1](task-01-bootstrap-the-local-application-shell.md) |
| 3 | [Deliver independent empty Dashboard summaries](task-03-deliver-independent-empty-dashboard-summaries.md) | pending | [Task 2](task-02-provision-couchbase-and-schema-readiness.md) |
| 4 | [Create, edit, and navigate Anytime tasks](task-04-create-edit-and-navigate-anytime-tasks.md) | pending | [Task 3](task-03-deliver-independent-empty-dashboard-summaries.md) |
| 5 | [Move Anytime tasks through effective-dated status](task-05-move-anytime-tasks-through-effective-dated-status.md) | pending | [Task 4](task-04-create-edit-and-navigate-anytime-tasks.md) |
| 6 | [Protect and order historical Task corrections](task-06-protect-and-order-historical-task-corrections.md) | pending | [Task 5](task-05-move-anytime-tasks-through-effective-dated-status.md) |
| 7 | [Add Fixed-day tasks and standard-Task copying](task-07-add-fixed-day-tasks-and-standard-task-copying.md) | pending | [Task 5](task-05-move-anytime-tasks-through-effective-dated-status.md) |
| 8 | [Complete the standard Task modal lifecycle](task-08-complete-the-standard-task-modal-lifecycle.md) | pending | [Task 6](task-06-protect-and-order-historical-task-corrections.md), [Task 7](task-07-add-fixed-day-tasks-and-standard-task-copying.md) |
| 9 | [Deliver daily binary Habits across both views](task-09-deliver-daily-binary-habits-across-both-views.md) | pending | [Task 4](task-04-create-edit-and-navigate-anytime-tasks.md) |
| 10 | [Add selected-day Habit scheduling](task-10-add-selected-day-habit-scheduling.md) | pending | [Task 9](task-09-deliver-daily-binary-habits-across-both-views.md) |
| 11 | [Add weekly and monthly Habit periods](task-11-add-weekly-and-monthly-habit-periods.md) | pending | [Task 10](task-10-add-selected-day-habit-scheduling.md) |
| 12 | [Add numeric Habit targets and progress](task-12-add-numeric-habit-targets-and-progress.md) | pending | [Task 11](task-11-add-weekly-and-monthly-habit-periods.md) |
| 13 | [Add effective-dated Habit details and editing](task-13-add-effective-dated-habit-details-and-editing.md) | pending | [Task 12](task-12-add-numeric-habit-targets-and-progress.md) |
| 14 | [Archive and transactionally delete Habits](task-14-archive-and-transactionally-delete-habits.md) | pending | [Task 13](task-13-add-effective-dated-habit-details-and-editing.md) |
| 15 | [Add Habit history and correction](task-15-add-habit-history-and-correction.md) | pending | [Task 14](task-14-archive-and-transactionally-delete-habits.md) |
| 16 | [Calculate per-Habit metrics](task-16-calculate-per-habit-metrics.md) | pending | [Task 15](task-15-add-habit-history-and-correction.md) |
| 17 | [Complete populated Dashboard summaries](task-17-complete-populated-dashboard-summaries.md) | pending | [Task 8](task-08-complete-the-standard-task-modal-lifecycle.md), [Task 14](task-14-archive-and-transactionally-delete-habits.md) |
| 18 | [Convert any standard Task to a Habit atomically](task-18-convert-any-standard-task-to-a-habit-atomically.md) | pending | [Task 8](task-08-complete-the-standard-task-modal-lifecycle.md), [Task 13](task-13-add-effective-dated-habit-details-and-editing.md) |
| 19 | [Verify mutation ambiguity, outages, and restart durability](task-19-verify-mutation-ambiguity-outages-and-restart-durability.md) | pending | [Task 15](task-15-add-habit-history-and-correction.md), [Task 18](task-18-convert-any-standard-task-to-a-habit-atomically.md) |
| 20 | [Harden content and request boundaries](task-20-harden-content-and-request-boundaries.md) | pending | [Task 16](task-16-calculate-per-habit-metrics.md), [Task 17](task-17-complete-populated-dashboard-summaries.md), [Task 18](task-18-convert-any-standard-task-to-a-habit-atomically.md) |
| 21 | [Complete accessible and responsive frontend behavior](task-21-complete-accessible-and-responsive-frontend-behavior.md) | pending | [Task 16](task-16-calculate-per-habit-metrics.md), [Task 17](task-17-complete-populated-dashboard-summaries.md), [Task 18](task-18-convert-any-standard-task-to-a-habit-atomically.md) |
| 22 | [Prove bounded query performance](task-22-prove-bounded-query-performance.md) | pending | [Task 16](task-16-calculate-per-habit-metrics.md), [Task 17](task-17-complete-populated-dashboard-summaries.md), [Task 19](task-19-verify-mutation-ambiguity-outages-and-restart-durability.md) |
| 23 | [Finalize private deployment and recovery acceptance](task-23-finalize-private-deployment-and-recovery-acceptance.md) | pending | [Task 19](task-19-verify-mutation-ambiguity-outages-and-restart-durability.md), [Task 20](task-20-harden-content-and-request-boundaries.md), [Task 21](task-21-complete-accessible-and-responsive-frontend-behavior.md), [Task 22](task-22-prove-bounded-query-performance.md) |
