# 0002 — Use local calendar keys

Accepted. Task dates and habit occurrence identities will be stored as device-local calendar keys rather than derived from UTC timestamps. Day keys use `YYYY-MM-DD`, Monday-based ISO week keys use `YYYY-Www`, and month keys use `YYYY-MM`. This preserves history when a device changes time zone, while accepting that devices in different time zones can simultaneously present different dates as Today.
