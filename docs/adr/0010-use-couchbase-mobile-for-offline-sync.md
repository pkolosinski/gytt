# 0010 - Use Couchbase Mobile for offline-first Android sync

## Status

Accepted. This decision refines [ADR 0001](./0001-use-self-hosted-couchbase.md):
the self-hosted Couchbase Server choice remains, but the future Android client
uses the Couchbase Mobile sync stack instead of a hand-written synchronization
protocol. It supersedes the future Room/SQLite adapter note in
[ADR 0005](./0005-use-shared-kotlin-jvm-capability-core.md); ADR 0005 remains
the decision for the shared core and state-based CQRS boundaries.

## Context

The Android client must remain useful while completely offline, persist its
changes locally, and synchronize bidirectionally with a database on the
operator's own server. The deployment must work on a small local Docker host,
must not depend on a cloud service, and should use a document-oriented
non-relational store.

Couchbase Server provides the server-side document store, queries, CAS, and
transactions, but it does not by itself provide a mobile local database or the
mobile replication protocol. The previous plan of using Room or SQLite on
Android and adding synchronization endpoints later would make synchronization
one of the largest custom features in the project.

## Decision

Use the self-hosted Couchbase Mobile stack:

```text
Couchbase Lite Community Edition (Android)
        <-> Sync Gateway (self-hosted)
        <-> Couchbase Server Community Edition
```

- **Couchbase Lite** is the Android client's local document database. UI reads
  and writes complete against it without waiting for a network connection.
- **Sync Gateway** is the private mobile synchronization and access-control
  boundary. It is deployed locally and is the only server endpoint used by the
  Couchbase Lite replicator.
- **Couchbase Server** remains the server-side source of truth and the
  persistence system used by GYTT's Ktor adapters.
- The web application continues to use the Ktor API. The future Android
  change must not write the same canonical documents through both the Ktor
  mutation API and Sync Gateway without an explicitly tested ownership rule.
- The future Android change must use deterministic document IDs and command
  identifiers, a deliberate Couchbase Lite conflict resolver, and replicated
  deletion markers. It must not rely on default last-write-wins behavior for
  Task status, Habit definitions, progress, or conversion semantics.
- Task-to-Habit conversion and any other operation that changes multiple
  canonical documents must be proven in an offline/reconnect prototype before
  the Android client is released. The prototype must either replicate one
  atomic command document for server-side transactional application or define
  and test a mergeable canonical-document model. Syncing two independent
  documents and assuming that replication preserves a Couchbase transaction is
  not acceptable.

The Android synchronization surface is a future change and is not implemented
by CHG-001. CHG-001 may provision Couchbase Server and its current Ktor
adapters, but it must not hard-code Room/SQLite or a custom change-journal
protocol as the future mobile architecture.

The exact Couchbase Mobile artifacts and licenses are pinned and reviewed when
the Android change is started. Couchbase Community Edition is source-available
under Couchbase-specific terms; it is not treated as an unrestricted
OSI-approved open-source stack. No cloud service or paid runtime is required
by this decision for the private, non-commercial deployment, subject to the
license terms of the selected releases.

## Consequences

### Benefits

- Native Kotlin/Android support with a durable local document database.
- Continuous bidirectional replication with reconnect and offline queuing
  supplied by the mobile stack rather than implemented by GYTT.
- Custom conflict resolution is available at the Couchbase Lite document
  boundary.
- The server remains document-oriented and can retain the existing CAS,
  SQL++, transaction, and aggregate model.
- Sync Gateway and Couchbase Server can run as pinned local containers with no
  external runtime dependency.

### Costs and constraints

- The deployment grows from two services to three when Android sync is added:
  GYTT, Sync Gateway, and Couchbase Server. Sync Gateway must be reachable
  through the operator's private HTTPS boundary, while its admin endpoint and
  Couchbase management ports remain private.
- Couchbase Mobile consumes more memory and has more operational surface than a
  single CouchDB container.
- Sync Gateway is a synchronization and authorization layer, not a substitute
  for GYTT domain validation. Dual writers and cross-document commands require
  an explicit design.
- Community Edition support and features are limited compared with Enterprise
  Edition. The selected releases' Community Edition and BSL/source-available
  notices must be kept with the dependency review.
- The local Android database is Couchbase Lite, not Room or SQLite. A later
  change cannot claim offline support while retaining a server-only API path.

## Alternatives considered

### Apache CouchDB with PouchDB or RxDB

This is the best open-source alternative and is easy to run in one container.
Its replication model is a good fit for JavaScript, Capacitor, or React Native,
but native Kotlin Android support would require a JavaScript runtime or a
custom replication client. CouchDB retains conflicting revision branches but
does not provide GYTT's semantic conflict policy automatically.

### ObjectBox Sync

ObjectBox offers an excellent native Kotlin local database and a lightweight
self-hosted sync server. It is the strongest operational alternative if a
commercial synchronization license is acceptable, but production Sync is
proprietary and the object model is less aligned with GYTT's JSON document
model.

### PowerSync with MongoDB

PowerSync has a Kotlin SDK and can be self-hosted, but the device store is
SQLite, the source database requires additional change-stream infrastructure,
and offline writes require an application-owned upload API and conflict
policy. It adds more moving parts without improving the document-store fit.

### Ditto

Ditto has strong offline and peer-to-peer CRDT capabilities, but its
self-managed deployment and licensing are disproportionate to a private
single-user application.

### Realm Device Sync

Realm remains usable as a local database, but Atlas Device Sync reached
end-of-life on 2025-09-30 and there is no supported self-hosted replacement.
It is not a viable foundation for a new synchronized application.

## Validation gate

Before implementing the Android synchronization change, run a small
self-hosted prototype against the pinned Couchbase Server and Sync Gateway
versions. It must demonstrate:

1. local create, edit, and delete while the server is unreachable;
2. durable reconnect and retry after the server returns;
3. deterministic handling of concurrent edits and deletion markers;
4. Task-to-Habit conversion without a partially synchronized result;
5. no runtime request to Couchbase Cloud or another external service; and
6. restart recovery for both the Android local database and server volume.

Failure of this gate reopens the sync-stack decision before domain persistence
implementation is broadened.

## References

- [Couchbase Lite Android data sync](https://docs.couchbase.com/couchbase-lite/current/android/replication.html)
- [Couchbase Lite Android conflict handling](https://docs.couchbase.com/couchbase-lite/current/android/conflict.html)
- [Sync Gateway deployment](https://docs.couchbase.com/sync-gateway/current/deployment.html)
- [Couchbase Community Edition license agreement](https://www.couchbase.com/community-license-agreement/)
- [CouchDB replication conflict model](https://docs.couchdb.org/en/stable/replication/conflicts.html)
- [ObjectBox Sync Server](https://sync.objectbox.io/sync-server)
- [PowerSync conflict handling](https://docs.powersync.com/handling-writes/handling-update-conflicts)
- [MongoDB Device SDK deprecation](https://www.mongodb.com/docs/atlas/device-sdks/deprecation/)
