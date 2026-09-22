# Task 15: Add Habit history and correction

**Status:** pending

**Depends on:** Task 14

**Description:** Derive missed status after a Local calendar period closes, retain partial progress, correct historical progress, and show history in the existing period-preserving details surface and Completed section. Add explicit-`asOf` open/closed period policy, bounded history reads, historical absolute progress correction, and immediate `REQUEST_PLUS` reload. Extend the details panel with history without changing its route or definition-edit ownership.

**Acceptance Criteria:**

- Scenarios "Mark a closed incomplete occurrence missed" and "Correct a missed occurrence" pass.
- Historical partial amounts remain visible after the period closes.
- Completed occurrences remain accessible in the collapsed counted section for the selected period.
- Existing Local calendar keys are not rewritten when `asOf` or the device time zone changes.
- Correction persistence survives a Couchbase round trip and updates immediately visible history.
