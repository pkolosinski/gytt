# Couchbase data-model follow-ups - CHG-001

## Status

This is an informational follow-up document for future implementation and review.
It does not change the accepted CHG-001 technical specification, the API contract,
or [ADR 0001](../../adr/0001-use-self-hosted-couchbase.md). The future Android
sync boundary is refined by [ADR 0010](../../adr/0010-use-couchbase-mobile-for-offline-sync.md).

Couchbase remains the selected server persistence system. Couchbase Lite and
Sync Gateway are the selected future mobile sync components; these notes record
possible document-model improvements and the conditions under which they should
be revisited.

## Assessment

The proposed model is a document-oriented hybrid rather than a purely
NoSQL-native model.

The following parts fit Couchbase well:

- `TaskDocument` and `HabitDocument` are aggregate-root documents with
  aggregate-local state.
- Task status transitions and Habit definition versions can be updated
  atomically with their owning aggregate.
- `HabitProgressDocument` is sparse, addressable by a deterministic
  `(habit, period)` key, and does not require pre-creating empty occurrences.
- Habit occurrences are projections, so the database does not contain a large
  collection of untouched recurring records.
- Consumed-ID receipts at the former entity key support durable deletion and
  deterministic retry behavior and must replicate as domain deletion markers
  when mobile sync is added.
- CAS, deterministic keys, and transaction boundaries are appropriate for the
  single-user application.

The following parts are more relational in shape:

- Resolving the last Task status effective on or before a requested date.
- Historical range metrics over generated Habit occurrences and progress.
- Indexing and filtering nested transition arrays.
- Atomic Task-to-Habit conversion across multiple documents and collections.
- The board-composition revision used as a cross-document read fence.

These relational characteristics do not invalidate Couchbase. They identify the
parts that require explicit access-pattern indexes, bounded application-side
resolution, and workload testing rather than assuming that a document model
automatically makes every query efficient.

## Future refinements

### 1. Make the persisted document union explicit

Every document should contain a discriminator and a schema version, including
documents stored in collections that also contain consumed-ID receipts.

For example:

```text
documentType: "task"
schemaVersion: 1
```

The corresponding receipt would use `documentType: "taskConsumedId"`.
The same convention should apply to Habit, progress, migration, and
composition-revision documents.

The current technical specification filters indexes by `documentType`, but the
normal `TaskDocument`, `HabitDocument`, and `HabitProgressDocument` definitions
do not list that field. This should be made consistent before indexes and
adapters are implemented.

Persisted Task variants should also use the same discriminated shape as the
wire model:

- an `anytime` document has `startDate` and no `fixedDate`;
- a `fixedDay` document has `fixedDate` and no `startDate`.

This reduces invalid states that a relational schema might otherwise reject
with constraints.

### 2. Specify key grammar and progress identity

The key grammar should be written down as an implementation contract, not left
as an adapter detail. A possible form is:

```text
task::<canonical-uuid>
habit::<canonical-uuid>
habit-progress::<canonical-uuid>::day::<yyyy-mm-dd>
habit-progress::<canonical-uuid>::week::<yyyy-Www>
habit-progress::<canonical-uuid>::month::<yyyy-MM>
```

Progress documents should also persist `periodType` and `periodKey`, even when
they are encoded in the key. This makes SQL++ range queries, diagnostics, and
future migrations less dependent on parsing keys.

Persisting the resolved `definitionVersionId` in a progress document is also
worth considering. It would make historical progress self-describing and avoid
re-resolving the definition for every read or metric calculation. The current
immutable definition history is sufficient for correctness, so this is a
denormalization and performance refinement, not a correctness prerequisite.

### 3. Design indexes from concrete access patterns

The implementation should define the actual filtered array index for
`statusTransitions` rather than only stating that transitions are indexed.
The preferred query shape is:

1. use the index to find Task candidates by type and date;
2. fetch the candidate documents by key where practical;
3. use the pure domain resolver to select the effective status.

The database query should not silently become the owner of the effective-date
business rule.

Habit progress indexes should support the actual metric range shape, such as
`habitId`, `periodType`, and a lexicographically sortable period key or explicit
period boundaries. All indexes must exclude consumed-ID receipts through the
document discriminator.

### 4. Keep aggregate history embedded until growth proves otherwise

Embedding Task transitions and Habit definition versions is the correct default
for this MVP. It keeps aggregate validation and CAS writes local and avoids
multi-document transactions for ordinary edits.

Task transitions are potentially unbounded, however. The implementation should
measure document size and transition counts and record a threshold for review.
If a long-lived Task can exceed that threshold, a later model can retain a
compact Task summary while moving old transitions to keyed child documents.
That migration should not be introduced speculatively: it would make
backdated edits and status resolution more expensive.

Habit definition versions are expected to remain much smaller, so they should
stay embedded unless real usage shows otherwise.

### 5. Treat metrics as the primary performance risk

On-demand occurrences avoid data explosion and should remain the default.
Metrics over five years with `REQUEST_PLUS` consistency are the least obviously
efficient path in the current design. The stated workload should be benchmarked
with:

- 10,000 Tasks;
- 100 Habits;
- five years of progress;
- schedule and target changes;
- mixed open and closed periods;
- immediate post-mutation reads.

Only if the measured path misses the 500 ms objective should the design add
targeted per-Habit or per-month rollups. Any rollup would need an explicit
consistency policy because the product requires acknowledged progress to be
visible immediately.

### 6. Make conversion provenance explicit

`TaskDocument.convertedHabitId` is sufficient to find the Habit from the Task,
but the conversion retry rule says the existing Habit must still represent the
original conversion. A nullable `sourceTaskId` or small `conversion` subdocument
on `HabitDocument` would make that relationship explicit in both documents.

This is useful NoSQL denormalization for deterministic idempotency checks and
future diagnostics. It does not require exposing conversion metadata in the
public API.

The singleton `TaskBoardCompositionRevisionDocument` remains reasonable for the
single-user MVP. Its owning collection should be stated explicitly, and a
future multi-user design would need a per-user revision key rather than one
global singleton.

### 7. Clarify intentional denormalization

`HabitDocument.startedOn` appears related to the initial definition's effective
date and is also used as an indexable field. Either make it derived, or state
that it is an immutable query-optimized copy with an invariant such as:

```text
startedOn == initial definition effectiveDate
```

Duplicated fields are appropriate in Couchbase when the invariant and update
owner are explicit.

## Decisions to preserve

The following changes would make the model less suitable for the stated
application and should not be introduced merely to appear more NoSQL-oriented:

- Do not pre-create every Habit occurrence.
- Do not split every nested value into a separate collection.
- Do not introduce an event store solely because Task status has history.
- Do not create a broad Dashboard projection while immediate read-after-write
  behavior is required.
- Do not allow direct cross-capability reads of another capability's
  collections.

The current capability-owned documents, sparse progress records, CAS writes,
and explicit conversion transaction are a better fit than either a fully
normalized document schema or a broad eventually consistent projection layer.

## Review triggers

Revisit this document and the `Data` section of `tech.md` when any of the
following occurs:

- the 95th-percentile 500 ms query objective is missed;
- Task documents show sustained transition-array growth;
- metrics require more than the stated five-year range;
- conversion or progress transactions show contention or repeated retries;
- a second user, tenant, or synchronization authority is introduced;
- indexes require queries that cannot be expressed without broad scans;
- a materialized rollup or historical child-document migration becomes
  necessary.
