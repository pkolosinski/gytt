# Decisions

This directory records concise, durable product and technical choices that
should guide more than one implementation step. Feature decisions that are not
recorded here may still apply to their feature's temporary plan. Decisions from
the former `docs/adr/` directory were reviewed and migrated here; records that
were no longer wanted were removed rather than retained as active guidance.

Each record states its status, category, and decision. Keep implementation
details in code, contracts, or the relevant module guidance. Update or replace
a record when a later accepted decision supersedes it; do not preserve obsolete
choices as active guidance.

## Current decisions

- [Use Couchbase Community for storage](use-couchbase-community.md)
- [Preserve Habit definition history](preserve-habit-definition-history.md)
- [Keep Dashboard summaries with their capabilities](capability-owned-dashboard-summaries.md)
- [Stage the access boundary](stage-access-boundary.md)
- [Use Couchbase Mobile for future offline Android sync](future-couchbase-mobile-sync.md)
