# GYTT operator acceptance checklist

Record the local host port and test date in the operator's private deployment
notes. Compose includes local-development credential defaults; do not add
operator production credentials or private certificates to this repository.

## Deferred access boundary

| Scenario | Result | Evidence / date |
| --- | --- | --- |
| Challenge unauthenticated access (final MVP) | [ ] deferred | |
| Serve authenticated access (final MVP) | [ ] deferred | |
| Reject an invalid shared credential (final MVP) | [ ] deferred | |
| Rate-limit repeated invalid credentials (final MVP) | [ ] deferred | |
| Prevent direct application access (final MVP) | [ ] deferred | |

These checks are intentionally deferred until the external HTTPS proxy is
configured for final MVP deployment. At that time, confirm that:

- Basic Auth is challenged by the external HTTPS proxy before GYTT receives a
  request.
- The proxy strips `Authorization` before forwarding and application logs never
  contain credentials.
- Invalid credentials receive the same `401` challenge and no HTTP fallback
  exists.
- Repeated failures are delayed or rejected uniformly, and valid access works
  again after the configured recovery interval.
- A LAN client cannot reach the application listener directly.
- Removing the proxy credential, certificate, or boundary leaves data
  untouched; restoring the boundary restores access.

## Shell and network checks

| Check | Result | Evidence / date |
| --- | --- | --- |
| Dashboard greeting and module links render | [x] pass [ ] fail | `router.test.tsx`, 2026-09-22 |
| Exact CSP is present | [x] pass [ ] fail | Local packaged-image check, 2026-09-22 |
| Browser reaches the local HTTP origin | [x] pass [ ] fail | Local packaged-image check, 2026-09-22 |
| No remote runtime assets are requested | [x] pass [ ] fail | Local packaged-image check, 2026-09-22 |
| Compose application binding is loopback-only | [ ] pass [ ] fail | Reverify after current Compose update |
| Couchbase Console is published only on host loopback | [ ] pass [ ] fail | Reverify after current Compose update |
| Couchbase data, query, and index ports are not published | [ ] pass [ ] fail | Reverify after current Compose update |
| Compose data network has no external egress | [x] pass [ ] fail | Final Compose smoke check, 2026-09-23 |
| Runtime identity cannot administer Couchbase users or cluster configuration | [ ] pass [ ] fail | Verify after bootstrap identity change |
| Readiness proves runtime KV and SQL++ access | [ ] pass [ ] fail | Verify against the bootstrapped Compose database |

Community Edition privacy settings are not attested by the current bootstrap;
the local data boundary relies on the internal no-egress network. The remaining
Tasks, Habits, persistence, and readiness acceptance scenarios are recorded as
their implementation slices are delivered.
