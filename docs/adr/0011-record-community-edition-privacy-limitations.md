# 0011 — Record Community Edition privacy limitations

Accepted. CHG-001 continues to use the pinned Couchbase Server Community
Edition image, but provisioning records the settings that Community Edition
cannot disable instead of claiming Enterprise-only behavior. The one-shot
provisioner treats the unsupported application-telemetry endpoint as
not-applicable and records that Community Edition requires
`sendStats=true` for usage/update reporting. Readiness accepts this state only
when the operator explicitly enables
`GYTT_COUCHBASE_ALLOW_COMMUNITY_PRIVACY_LIMITATIONS=true`.

The Compose data network is internal and has no external egress. This keeps
the product's personal and usage data inside the user-operated deployment even
though Couchbase reports the immutable Community Edition setting. The
long-running GYTT service still receives no administrator credential.

Community Edition also does not provide the desired collection-scoped
application roles. GYTT therefore creates a bucket-scoped `bucket_full_access`
runtime user. That identity cannot administer Couchbase users or cluster
configuration, but it is broader than the intended Enterprise role boundary;
the limitation is documented and covered by the persistence integration test.

## Consequences

- The local deployment remains available without a paid Couchbase license.
- Privacy and privilege limitations are visible in the migration record and
  cannot silently turn into a healthy deployment when the opt-in is absent.
- The private network boundary becomes part of the data-locality guarantee.
- Moving to Enterprise Edition later can remove the opt-in and replace the
  runtime role with collection-scoped permissions through a forward deployment
  change.
