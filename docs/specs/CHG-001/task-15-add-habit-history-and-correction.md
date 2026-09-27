# Task 15: Add Habit history and correction

**Status:** pending

**Depends on:** Task 14

**Description:** Extend the accepted period-preserving Habit details UI with mock historical progress, missed/partial status, and correction states; obtain UI acceptance before defining the history API. Then add the bounded history/correction OpenAPI contract, generate the client, and connect the UI. Implement Local-period closure policy, bounded history query, historical absolute correction, transaction/reload behavior, and Couchbase verification last.

Implementation subtasks:

1. [ ] Extend the details panel with mock bounded history, missed/partial states, and correction controls while preserving the route and Completed section.
2. [ ] Add component tests for mocked missed display, partial amount retention, correction, and Completed access; obtain UI acceptance before defining the history API.
3. [ ] Define and verify the bounded history/correction OpenAPI contract and regenerate the client.
4. [ ] Connect the accepted history and correction UI to the generated client contract.
5. [ ] Add explicit-`asOf` open/closed period policy tests for day, week, and month boundaries and derive missed status without losing progress.
6. [ ] Add bounded historical occurrence query ports/adapters with parameterized `REQUEST_PLUS` reads.
7. [ ] Permit absolute progress correction for historical occurrences through existing transactional lifecycle/version checks.
8. [ ] Add Couchbase round-trip tests proving partial progress survives closure, correction becomes done, and immediate history reload sees it.
9. [ ] Add Local calendar regression tests proving changed `asOf` or device time zone never rewrites existing period keys.
10. [ ] Add end-to-end tests for history/correction behavior and unchanged routes.

**Acceptance Criteria:**

- Scenarios "Mark a closed incomplete occurrence missed" and "Correct a missed occurrence" pass.
- Historical partial amounts remain visible after the period closes.
- Completed occurrences remain accessible in the collapsed counted section for the selected period.
- Existing Local calendar keys are not rewritten when `asOf` or the device time zone changes.
- Correction persistence survives a Couchbase round trip and updates immediately visible history.
- The history/correction UI is accepted with mock data before its OpenAPI contract and backend implementation begin.
