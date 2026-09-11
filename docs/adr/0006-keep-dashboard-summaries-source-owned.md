# 0006 — Keep Dashboard summaries source-owned

Accepted. There is no MVP backend Dashboard module. Tasks owns its day-summary read model and endpoint, Habits owns its day-summary read model and endpoint, and the React Dashboard loads them independently so one failure does not hide the other card. A query-only module named `daily-overview` may be introduced later when cross-capability or materially more complex projections justify their own storage and synchronization lifecycle.
