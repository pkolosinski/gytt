# GYTT operator acceptance checklist

Record the local host port and test date in the operator's private deployment
notes. Do not add credentials or private certificates to this repository.

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
| Dashboard greeting and module links render | [ ] pass [ ] fail | |
| Exact CSP is present | [ ] pass [ ] fail | |
| Browser reaches the local HTTP origin | [ ] pass [ ] fail | |
| No remote runtime assets are requested | [ ] pass [ ] fail | |
| Compose application binding is loopback-only | [ ] pass [ ] fail | |
| Couchbase has no published host ports | [ ] pass [ ] fail | |

The remaining Tasks, Habits, persistence, and readiness acceptance scenarios
are recorded as their implementation slices are delivered.
