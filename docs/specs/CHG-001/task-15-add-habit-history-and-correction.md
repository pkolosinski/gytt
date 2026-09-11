# Task 15: Add Habit history and correction

**Status:** pending

**Depends on:** Task 14

**Description:** Derive missed status after a Local calendar period closes, retain partial progress, correct historical progress, and show history in the existing period-preserving details surface and Completed section. Add explicit-`asOf` open/closed period policy, bounded history reads, historical absolute progress correction, and immediate `REQUEST_PLUS` reload. Extend the details panel with history without changing its route or definition-edit ownership.

Implementation subtasks:

1. [ ] Add explicit-`asOf` open/closed period policy tests for day, week, and month boundaries.
2. [ ] Derive missed status for closed incomplete occurrences while retaining untouched or partial recorded progress.
3. [ ] Add bounded historical occurrence query ports/adapters with parameterized `REQUEST_PLUS` reads.
4. [ ] Permit absolute progress correction for historical occurrences through the existing transactional lifecycle/version checks.
5. [ ] Add Couchbase round-trip tests proving historical partial progress survives closure, correction becomes done, and immediate history reload sees it.
6. [ ] Extend the existing period-preserving details panel with bounded history and retain completed occurrences in the collapsed counted section.
7. [ ] Add component tests for missed display, partial amount retention, correction, Completed-section access, and unchanged routes.
8. [ ] Add Local calendar regression tests proving changed `asOf` or device time zone never rewrites existing period keys.

**Acceptance Criteria:**

- Scenarios "Mark a closed incomplete occurrence missed" and "Correct a missed occurrence" pass.
- Historical partial amounts remain visible after the period closes.
- Completed occurrences remain accessible in the collapsed counted section for the selected period.
- Existing Local calendar keys are not rewritten when `asOf` or the device time zone changes.
- Correction persistence survives a Couchbase round trip and updates immediately visible history.
