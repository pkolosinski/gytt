# Implementation plan

## Task 1: Bootstrap the local application shell

**Status:** in progress

**Depends on:** None

**Description:**


**Behaviour:** Deliver the first useful end-to-end slice: start the packaged React/Ktor application on a loopback-only Compose binding, serve the static Dashboard greeting and Tasks/Habits links from local assets, and exercise it directly from localhost. Reverse-proxy authentication is deferred until final MVP deployment.

**Implementation subtasks:**

1. **Pin and verify the JVM build**
   - **Status:** done
   - Confirm the Gradle wrapper, JVM target, Kotlin version, Ktor version, and server build task are reproducible.
   - Verified with `./gradlew :apps:server:compileKotlin`; the build completed successfully using Gradle 9.7.1 and JVM toolchain 17.

2. **Pin and verify the web build**
   - **Status:** done
   - Confirmed the committed `apps/web` lockfile installs with pnpm 12.4.2 and that the Vite production build succeeds.
   - Verified with `corepack pnpm --dir apps/web install --frozen-lockfile && corepack pnpm --dir apps/web build`.

3. **Replace the starter Dashboard content**
   - **Status:** done
   - Replaced the Vite demo with the static non-personalized greeting and local links to `/tasks` and `/habits/day`.
   - Kept the change limited to the Dashboard shell and its Tailwind utility classes.

4. **Add placeholder Tasks and Habits routes**
   - **Status:** done
   - Added local placeholder screens for `/tasks`, `/habits/day`, `/habits/week`, and `/habits/month` so the Dashboard and default period routes resolve within the SPA.
   - Do not implement task or habit behavior in this subtask.

5. **Add the server liveness endpoint**
   - **Status:** pending
   - Add the private `/health/live` response required by container checks.
   - Keep the endpoint free of configuration, credential, database, and personal-data details.

6. **Add request trace IDs**
   - **Status:** pending
   - Generate or propagate a request trace ID at the Ktor boundary and include it in the response and structured request logging.
   - Never log authorization headers or request bodies.

7. **Add the exact Content Security Policy**
   - **Status:** pending
   - Serve the specified self-contained CSP on the SPA response and verify that no permissive fallback is emitted.
   - Keep runtime assets local to the packaged application.

8. **Package the compiled SPA in the server image**
   - **Status:** pending
   - Make the multi-stage image copy the web production output into Ktor classpath resources and serve it from the packaged runtime image.
   - Verify that the runtime image contains no development server dependency.

9. **Restrict the Compose application binding**
   - **Status:** pending
   - Publish the application only on `127.0.0.1:${GYTT_HOST_PORT}` and remove all Couchbase host-port publications.
   - Preserve the private Compose network between the application and Couchbase.

10. **Add the local Docker smoke script**
    - **Status:** pending
    - Create `deploy/smoke-shell.sh` to build and start the application service, request liveness and the shell, check the exact CSP, verify the resolved loopback binding, and clean up on success or failure.
    - Do not configure or test the deferred external proxy.

11. **Record the local operator checks**
    - **Status:** pending
    - Update the local acceptance evidence for the greeting, module links, CSP, local assets, loopback binding, and unpublished Couchbase ports.
    - Leave HTTPS, Basic Auth, rate limiting, credential stripping, and proxy-bypass checks deferred to final MVP deployment.

12. **Run the complete Task 1 verification**
    - **Status:** pending
    - Run the documented server tests, web tests, web build, and local Docker smoke script together.
    - Mark Task 1 complete only after all required checks pass.

**Verification command:** `./gradlew :apps:server:test && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/app && npm --prefix apps/web run build && ./deploy/smoke-shell.sh`

**Acceptance Criteria:**

- The application shell renders the static non-personalized greeting and links to `/tasks` and the default Habits routes from locally compiled assets.
- The packaged image starts, serves the locally built shell and exact CSP, and is reachable only through its configured loopback host socket.
- The local deployment checklist records the shell, CSP, local asset, and loopback checks.
- The resolved Compose application port is loopback-only and no unrestricted binding is provided.
- The application is reachable directly at the configured localhost port without requiring the deferred proxy.

## Task 2: Provision Couchbase and schema readiness

**Status:** pending

**Depends on:** Task 1

**Description:** Establish the server-side Couchbase document model and
readiness gates without baking a server-only mobile synchronization protocol
into the schema. The future Android sync stack is Couchbase Lite plus
self-hosted Sync Gateway as recorded in ADR 0010; Android synchronization is
not implemented by CHG-001.


**Behaviour:** Make the private service ready only after Couchbase, schema, permissions, disabled usage sharing, compatible migration state, and a bounded database check succeed.

**Implementation action:** Add the singleton Java SDK Cluster and transaction manager, zero-replica `gytt` bucket, `app` scope, four collections, filtered secondary indexes, least-privileged runtime identity, mounted secret files with permission checks, `MAJORITY_AND_PERSIST_TO_ACTIVE`, `REQUEST_PLUS` query helper, the initial `task-board-composition::current` document, and a checksum-verified forward migration. Keep persisted documents discriminated, deterministic-ID based, and compatible with the future Couchbase Lite/Sync Gateway boundary; do not add Room/SQLite assumptions, a custom mobile change journal, or a direct mobile sync endpoint in this task. Implement all telemetry, usage-sharing, update-check, schema-compatibility, secret, privilege, and bounded database readiness gates here. Add explicit KV, query, transaction, ambiguity-read-back, and Ktor deadline configuration and reject invalid internal ordering at startup.

**Verification command:** `./gradlew :apps:server:test && ./gradlew :apps:server:integrationTest --tests 'gytt.server.couchbase.*' && docker compose config --quiet`

**Acceptance Criteria:**

- Scenario "Reject an incompatible schema at startup" keeps API readiness at `503` and accepts no feature mutation.
- Scenario "Block readiness when usage sharing is enabled" keeps readiness at `503` when any provisioning attestation is absent or false.
- Persistence tests prove user-facing SQL++ is configured for `REQUEST_PLUS`, runtime credentials cannot perform migration administration, and secret values never enter readiness responses.
- Startup rejects invalid internal timeout ordering and accepts a configuration that leaves the required ambiguity-read-back allowance.
- An interrupted migration reruns only before its checksum is recorded; checksum mismatch or incompatible partial state remains unhealthy.
- The initial schema is forward-only; incompatible reversal requires the recorded local backup procedure rather than a down migration.
- The persisted document keys and discriminators are usable as the future Couchbase Lite/Sync Gateway sync contract; no migration assumes Room/SQLite or a server-only change journal.

## Task 3: Deliver independent empty Dashboard summaries

**Status:** pending

**Depends on:** Task 2

**Description:**


**Behaviour:** Return zero standard-Task counts and no scheduled Habits from separate source-owned endpoints, and let each Dashboard card load, fail, and retry independently without creating a backend Dashboard module.

**Implementation action:** Add the minimal public capability facades and read ports, parameterized `REQUEST_PLUS` adapters over the empty collections, common problem mapping, source-owned Ktor routes, canonical OpenAPI schemas, generated TypeScript client, redacted request logging/counters, and card-local loading/error/empty state. Add hostile bound-value integration coverage with the first SQL++ adapters instead of deferring injection protection. The Habits facade also exposes the due-day query needed by the future composite Tasks board; it correctly returns no occurrences while no Habit exists.

**Verification command:** `./gradlew :core:tasks:test :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/dashboard`

**Acceptance Criteria:**

- Scenario "Show an empty Habit summary" shows no percentage and the specified empty message.
- Scenario "Preserve one Dashboard card when the other fails" leaves the successful card visible and retries only the failed card.
- Empty Tasks summary returns zero completed and remaining standard Tasks.
- Summary routes, adapters, and tests remain under their owning Tasks and Habits packages; no server Dashboard package or shared Dashboard persistence is added.
- Storage failure is explicit and does not produce success-shaped empty data.
- Scenario "Bind every SQL++ value" passes for the summary adapters and fixed startup-validated identifiers.

## Task 4: Create, edit, and navigate Anytime tasks

**Status:** pending

**Depends on:** Task 3

**Description:**


**Behaviour:** Open Tasks on device Today, navigate exact LocalDates, preserve the three-column empty structure, create an Anytime task with a default or future start, edit its fields, read it directly by ID for conflict recovery, and carry it through its active interval. The board request composes the Tasks result with the public Habits due-day query behind the bounded composition-revision fence and fails as one unit.

**Implementation action:** Add canonical caller-ID validation, deterministic document keys, aggregate revisions, To do initialization, Anytime visibility policy, update constraints, `TaskRecordView`, source-owned summary updates, and parameterized board adapter. Establish the common bounded mutation executor and operation-specific ambiguity/outage tests with this first real mutation. Implement the board coordinator that reads the initial composition revision around both capability queries and retries as specified. Add body limits, safe errors, shared storage/indeterminate-result UI, the OpenAPI create/update/by-ID/composite-read contract, and generated client. Build the date routes, navigation, stable empty board, unified modal shell, discriminated Anytime editor, and literal-text rendering tests. Apply Origin validation before mutation body processing and exact postcondition read-back after ambiguous durable writes.

**Verification command:** `./gradlew :core:tasks:test :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/tasks`

**Acceptance Criteria:**

- Scenarios "Keep an empty Tasks board structurally stable", "Open and navigate Task dates", and "Fail a composite Tasks board as one unit" pass.
- Scenarios "Carry an Anytime task through its active interval", "Edit an Anytime task", "Create an Anytime task with the default start", and "Create an Anytime task with a future start" pass.
- Scenario "Reject a cross-origin mutation" returns `403 ORIGIN_REJECTED` before body processing and creates no Task.
- Scenario "Reject a non-canonical UUID" fails before facade or key construction.
- The board-composition coordinator returns the stable empty board when its surrounding revision is unchanged and returns a whole-board retryable error after bounded revision churn.
- Identical same-ID creation returns the existing Task; different content returns `409 ID_REUSED`.
- Rejected validation or a version conflict leaves stored state unchanged and preserves the editor draft.
- Scenario "Render user content as text" passes for the first Task card and modal surfaces.

## Task 5: Move Anytime tasks through effective-dated status

**Status:** pending

**Depends on:** Task 4

**Description:**


**Behaviour:** Move an Anytime task in either direction among To do, In progress, and Completed by pointer or keyboard, preserve historical status, hide it after completion, and allow a later transition to reopen it.

**Implementation action:** Add monotonic transition sequences, effective-date resolution, start-date validation, desired-state idempotency, revision/CAS writes, source-owned summary updates, and operation-specific unambiguous, ambiguous-timeout, read-back, and storage-outage tests. Add pointer movement, the equivalent keyboard Move action, visible focus, announcements, and affected-control-only mutation state.

**Verification command:** `./gradlew :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/tasks`

**Acceptance Criteria:**

- Scenarios "Move an Anytime task in progress", "Complete an Anytime task on the viewed date", and "Reopen a completed Anytime task" pass.
- Scenario "Reject completion before an Anytime task starts" returns `422 INVALID_CALENDAR_OPERATION` without mutation.
- Scenarios "Keep completed Tasks visible" and "Move a Task without dragging" pass for standard Tasks.
- Repeating the same desired status on the same effective date is idempotent.
- A stale aggregate version returns `409 VERSION_CONFLICT` and never overwrites a newer transition.
- A dispatched status timeout returns success only after exact read-back; otherwise it returns `COMMIT_UNKNOWN`, and database outage never produces a success-shaped result.

## Task 6: Protect and order historical Task corrections

**Status:** pending

**Depends on:** Task 5

**Description:**


**Behaviour:** Reject backdated completion before a later completion until the user confirms removal of every later log, and resolve multiple accepted same-date corrections by aggregate-local sequence rather than timestamp precision.

**Implementation action:** Add `discardLaterTransitions`, the `LATER_TASK_STATUS_EXISTS` result, sequence-based ordering, and one revision/CAS write that truncates and appends atomically. Exercise ambiguity immediately before and after the truncating write so read-back proves the complete requested transition set, not merely the selected status. Add the named warning dialog and retry only after confirmation with the reloaded current version.

**Verification command:** `./gradlew :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run BackdatedCompletionDialog`

**Acceptance Criteria:**

- Scenario "Confirm backdated completion removes later logs" first changes nothing, then removes all later logs and completes the selected date after confirmation.
- Scenario "Resolve same-date Task corrections deterministically" always selects the greatest transition sequence.
- Cancelling the warning sends no confirmed mutation.
- A conflict between warning and confirmation reloads the newer Task and removes no newer log.
- Rejected and confirmed paths follow the recovery rules for unchanged state and one CAS-guarded write.

## Task 7: Add Fixed-day tasks and standard-Task copying

**Status:** pending

**Depends on:** Task 5

**Description:**


**Behaviour:** Create and edit Fixed-day tasks, show them only on their scheduled day with no overdue carry-forward, correct details/status from history, copy a non-completed historical Fixed-day Task, and copy an Anytime Task through the same standard-Task modal into one new Task.

**Implementation action:** Extend the discriminated Task model, validation, visibility, status-effective-date rule, update behavior, persistence mapping, and OpenAPI contract. Implement Copy for both standard Task types through canonical caller-ID Task creation, leaving the source unchanged; the Fixed-day product path remains limited to a non-completed source. Exercise create ambiguity, ID reuse, and storage outage through the copy workflow. Extend the unified editor/modal with Fixed-day fields and historical behavior.

**Verification command:** `./gradlew :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/tasks`

**Acceptance Criteria:**

- Scenarios "Create a Fixed-day task", "Keep a Fixed-day task on its fixed date", and "Correct a past Fixed-day task" pass.
- Scenarios "Copy a historical Task", "Copy an Anytime Task", and "Edit a historical Fixed-day task" pass without duplicating the source.
- A Fixed-day status effective date other than its fixed date returns `422 INVALID_CALENDAR_OPERATION`.
- A same-ID copy retry returns the existing copy; different content returns `409 ID_REUSED`.
- Past and completed Fixed-day Tasks remain reachable through exact date navigation.

## Task 8: Complete the standard Task modal lifecycle

**Status:** pending

**Depends on:** Task 6, Task 7

**Description:**


**Behaviour:** Use one modal for standard Task details, create/edit, copy, and deletion; require a named confirmation before permanent deletion; preserve deleted IDs without deleted personal content; and surface stale edits by loading the newer value even when it moved off the selected board.

**Implementation action:** Complete update constraints and the Task-by-ID reload path. Implement versioned deletion as replacement with `TaskConsumedIdReceipt`, exclude receipts from all reads, reject later creation with the consumed ID, and prove ambiguous deletion only by receipt read-back. Add delayed-create and repeated-delete integration tests, OpenAPI mappings, conflict reload state, focus restoration, field-associated errors, and affected-control-only disabling. Keep a single modal extension point for the later conversion form rather than creating a second Task details surface.

**Verification command:** `./gradlew :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/tasks`

**Acceptance Criteria:**

- Scenario "Refuse a stale Task update" returns `409 VERSION_CONFLICT`, preserves the newer Task, and reloads it.
- Scenario "Reload a Task that moved off the selected board" loads `TaskRecordView`, refreshes the board without the card, and never reports the stale edit as saved.
- Scenarios "Cancel permanent Task deletion" and "Confirm permanent Task deletion" pass.
- Selecting any standard Task card opens the same modal for details, edit, copy, and delete.
- Scenario "Prevent delayed create from reversing deletion" returns `409 ID_REUSED` and retains no deleted personal content.
- Ambiguous deletion is reported successful only after the consumed-ID receipt is read; otherwise it returns `COMMIT_UNKNOWN`.
- Rejected or conflicted mutations leave stored state unchanged and are safe to retry after reload.

## Task 9: Deliver daily binary Habits across both views

**Status:** pending

**Depends on:** Task 4

**Description:**


**Behaviour:** Create a daily binary Habit with caller-generated Habit and definition IDs, project its day occurrence in Habits and Tasks, toggle absolute progress from either view, and keep completed occurrences accessible. Creation stays in local modal state; the Habit-task modal links to the matching Habits day.

**Implementation action:** Add the Habit aggregate, canonical Habit and definition IDs, first immutable definition, revision/sequence fields, deterministic day occurrence, composite occurrence version, source-owned day summary, and transactional binary progress write that reads Habit and progress. Add operation-specific progress ambiguity, timeout, stale-lifecycle, and storage-outage tests now. Extend the existing composite board with a distinct non-draggable Habit card and shared progress control. Build the day page, local create modal, incomplete list, collapsed Completed section, simple Habit-task details mode, and literal-text tests for Habit fields.

**Verification command:** `./gradlew :core:habits:test :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/habits src/tasks`

**Acceptance Criteria:**

- A valid daily binary Habit returns the selected definition and projects only its applicable day occurrence.
- Scenarios "Create a Habit without changing the route", "Keep completed Habits accessible", "Synchronize occurrence progress between views", and "Open Habit-task details from Tasks" pass.
- Scenario "Read acknowledged progress immediately" passes for the day period, Tasks board, and Habit summary using `REQUEST_PLUS`.
- Binary absolute progress retries are idempotent when Habit revision and definition ID still match.
- Habit occurrences never enter the standard Task summary counts.
- Dispatched progress timeouts return success only after exact occurrence read-back; otherwise they return `COMMIT_UNKNOWN`.
- Scenario "Render user content as text" remains green for Habit list, card, and modal surfaces.

## Task 10: Add selected-day Habit scheduling

**Status:** pending

**Depends on:** Task 9

**Description:**


**Behaviour:** Create a Habit on unique selected ISO weekdays, project it only on due days, and expose each due occurrence through the same Habits day list and Tasks board behavior as a daily Habit.

**Implementation action:** Add selected-weekday validation and applicability to the core schedule policy, OpenAPI union, persistence mapping, editor, summary, and due-day query. Reuse the existing daily occurrence identity, binary progress transaction, and Habit card rather than adding a new path.

**Verification command:** `./gradlew :core:habits:test :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run HabitEditor`

**Acceptance Criteria:**

- Selected weekdays are unique integers `1..7` ordered Monday first.
- A selected-day occurrence appears in Tasks and Habits only on a due LocalDate.
- Non-due days do not create a card, summary count, or progress identity.
- Existing daily Habit behavior remains unchanged.

## Task 11: Add weekly and monthly Habit periods

**Status:** pending

**Depends on:** Task 10

**Description:**


**Behaviour:** Create one occurrence per Monday-based ISO week or calendar month, default each Habit module to the current device period, navigate exact past/future period routes, and keep weekly/monthly occurrences out of Tasks.

**Implementation action:** Add canonical ISO week and YearMonth keys, weekly/monthly schedule applicability, deterministic occurrence identities, period parsing, OpenAPI schemas, keyed/default routes, navigation, and empty-period UI. Reuse binary progress and the Completed section from the day slice.

**Verification command:** `./gradlew :core:habits:test :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/habits`

**Acceptance Criteria:**

- Scenarios "Default Habit routes to current periods", "Navigate Habit periods", and "Use Monday weeks and calendar months" pass.
- Scenario "Project only day-based Habit tasks" includes daily/due selected-day occurrences and excludes weekly/monthly ones.
- Malformed or impossible calendar routes show the not-found state instead of normalization.
- Weekly and monthly progress uses the same absolute, deterministic period-key storage path.

## Task 12: Add numeric Habit targets and progress

**Status:** pending

**Depends on:** Task 11

**Description:**


**Behaviour:** Create numeric targets with optional units, edit progress by increment, decrement, or direct absolute entry, distinguish untouched/partial/done, prevent negative values, display uncapped percentages, and place partial day-based Habit cards in In progress.

**Implementation action:** Add canonical bounded decimal strings, target/unit validation, numeric occurrence state, percentage calculation, absolute transactional writes, retry semantics, form controls, and card rendering. Increment/decrement computes a new absolute value before submission; no relative command is added.

**Verification command:** `./gradlew :core:habits:test :core:tasks:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/habits src/tasks`

**Acceptance Criteria:**

- Scenarios "Create every supported Habit schedule and target", "Use binary and numeric progress controls", and "Distinguish Habit occurrence states" pass.
- Scenarios "Record numeric overachievement" and "Reject progress below zero" pass.
- Scenario "Place Habit cards by progress" maps untouched, partial, and done to To do, In progress, and Completed and disallows manual dragging.
- Numeric zero is untouched, positive below target is partial, and target or above is done.
- An absolute retry is successful only under the specified Habit/definition compatibility rule.

## Task 13: Add effective-dated Habit details and editing

**Status:** pending

**Depends on:** Task 12

**Description:**


**Behaviour:** Open the period-preserving Habit details/edit route, append caller-ID immutable definitions from a chosen effective date, retain compatible open progress, reject incompatible reinterpretation, preserve closed periods, and retry a lost definition response without duplication.

**Implementation action:** Add definition IDs and aggregate-local sequences, as-of resolution, title/details-only edits, compatibility policy for open progress, revision/CAS updates, ID reuse detection, and operation-specific ambiguity/timeout/outage tests with deterministic read-back. Add the route-backed panel/full-page component shell. Task 13 owns the actual routes so its edit workflow can land green; later history work extends the same surface.

**Verification command:** `./gradlew :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/habits`

**Acceptance Criteria:**

- Scenarios "Replace an open weekly definition", "Reject an incompatible open-period definition", and "Preserve closed history after definition change" pass.
- Scenario "Retry a Habit definition version" returns the current Habit for identical reuse and `409 ID_REUSED` for different content.
- Scenario "Open responsive Habit details" passes at the route-selection and component-layout seam; real-browser layout remains in operator acceptance.
- Effective dates before client Today return `422 INVALID_CALENDAR_OPERATION`.
- A stale non-idempotent definition edit returns `409 VERSION_CONFLICT` without overwriting newer state.

## Task 14: Archive and transactionally delete Habits

**Status:** pending

**Depends on:** Task 13

**Description:**


**Behaviour:** Archive from a non-past date without losing history, allow permanent deletion only before the first applicable occurrence and any progress, replace deleted personal content with a consumed-ID receipt, prevent delayed recreation, and serialize deletion with progress/lifecycle changes so no orphan progress can commit.

**Implementation action:** Add archive policy and revision update with operation-specific ambiguity, timeout, and outage tests. Add the deletion transaction that reads the Habit, validates the caller version and first applicable occurrence against client Today, runs the parameterized progress-history query, and replaces the Habit with `HabitConsumedIdReceipt` only when both history checks are empty. Exclude receipts from reads, reject later creation with the consumed ID, and prove ambiguous deletion only by receipt read-back. Ensure progress transactions read the same Habit revision and resolved definition. Add archive/delete controls and named confirmation to the existing route-backed details surface.

**Verification command:** `./gradlew :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/habits`

**Acceptance Criteria:**

- Scenarios "Archive a Habit", "Prevent deleting Habit history", and "Delete an unused Habit" pass.
- Scenario "Prevent delayed create from reversing deletion" passes for an unused Habit.
- Scenario "Serialize Habit deletion with progress" permits at most one coherent lifecycle result.
- Scenario "Reject progress against a stale Habit lifecycle" returns `409 VERSION_CONFLICT` and creates no stale/orphan progress.
- A rejected or rolled-back lifecycle transaction changes neither Habit nor progress state.
- Archive dates before client Today are rejected and an archived Habit produces no occurrence on or after its archive date.

## Task 15: Add Habit history and correction

**Status:** pending

**Depends on:** Task 14

**Description:**


**Behaviour:** Derive missed status after a Local calendar period closes, retain partial progress, correct historical progress, and show history in the existing period-preserving details surface and Completed section.

**Implementation action:** Add explicit-`asOf` open/closed period policy, bounded history reads, historical absolute progress correction, and immediate `REQUEST_PLUS` reload. Extend the details panel with history without changing its route or definition-edit ownership.

**Verification command:** `./gradlew :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/habits`

**Acceptance Criteria:**

- Scenarios "Mark a closed incomplete occurrence missed" and "Correct a missed occurrence" pass.
- Historical partial amounts remain visible after the period closes.
- Completed occurrences remain accessible in the collapsed counted section for the selected period.
- Existing Local calendar keys are not rewritten when `asOf` or the device time zone changes.
- Correction persistence survives a Couchbase round trip and updates immediately visible history.

## Task 16: Calculate per-Habit metrics

**Status:** pending

**Depends on:** Task 15

**Description:**


**Behaviour:** Report Completion rate over expected occurrences and uncapped Target attainment for one numeric Habit, while returning the specified null reason when target attainment is not meaningful.

**Implementation action:** Enumerate expected occurrences across immutable definitions and archive dates, count fully met targets, sum compatible numeric progress/targets, preserve units, cap the range at five years, and use a bounded parameterized `REQUEST_PLUS` query. Add hostile bound-value integration coverage with this first metrics query. Render the metrics in the existing details surface without introducing mixed-Habit aggregation.

**Verification command:** `./gradlew :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run MetricSummary`

**Acceptance Criteria:**

- Scenario "Calculate Completion rate" returns `75%` for three completed of four expected occurrences.
- Scenario "Calculate per-Habit target attainment" returns uncapped `145%`.
- Scenario "Avoid a mixed-unit metric" retains Completion rate and returns null Target attainment with `mixedUnits`.
- Binary targets and no-occurrence ranges return their specified reasons.
- Invalid or over-five-year ranges return `422 VALIDATION_FAILED`.

## Task 17: Complete populated Dashboard summaries

**Status:** pending

**Depends on:** Task 8, Task 14

**Description:**


**Behaviour:** Populate the Tasks card with completed/remaining standard Tasks and the Habits card with today's completed percentage and incomplete occurrences, while retaining independent request, failure, and retry states.

**Implementation action:** Complete each capability's source-owned day-summary policy and bounded adapter over real documents. Exclude Habit occurrences from Task counts, use explicit device Today, and keep null Habit percentage for no scheduled occurrences. Finish populated card rendering without moving backend ownership into a Dashboard package.

**Verification command:** `./gradlew :core:tasks:test :core:habits:test :apps:server:test :apps:server:integrationTest && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/dashboard`

**Acceptance Criteria:**

- Scenario "Show the minimal Dashboard" shows two completed/three remaining standard Tasks and `25%` plus three incomplete Habits.
- Scenarios "Show an empty Habit summary" and "Preserve one Dashboard card when the other fails" remain green.
- Habit occurrences never affect Task summary counts.
- An immediately requested summary includes acknowledged progress through `REQUEST_PLUS`.

## Task 18: Convert any standard Task to a Habit atomically

**Status:** pending

**Depends on:** Task 8, Task 13

**Description:**


**Behaviour:** Prefill a valid Habit from either standard Task type, then atomically create the supplied Habit/definition IDs, complete the source Task with a write-once visible reference, and increment the board-composition revision. Apply the same backdated confirmation rule, reject a different second conversion after reopening, keep composite board reads wholly before or after conversion, and reconcile ambiguous conversion commits.

**Implementation action:** Add the thin cross-capability workflow and abstract unit-of-work, with policy remaining in Tasks/Habits. Use a side-effect-free Couchbase transaction to validate Task revision and the write-once `convertedHabitId`, insert Habit, append the sequenced completion/reference, and increment the board-composition revision only for a new conversion. Add identical-retry and `TASK_ALREADY_CONVERTED` behavior, known rollback, deterministic read-back, dispatched-timeout coverage, and integration tests that pause conversion between the two board queries to prove the revision fence. Extend the existing Task modal rather than creating a second details surface.

**Verification command:** `./gradlew :core:tasks:test :core:habits:test :apps:server:test :apps:server:integrationTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/tasks`

**Acceptance Criteria:**

- Scenarios "Prefill Task conversion" and "Convert a Task atomically" pass for Anytime and Fixed-day source Tasks.
- Scenario "Confirm a backdated conversion removes later logs" first changes neither aggregate, then commits one coherent result after confirmation.
- Scenarios "Reject a second Task conversion", "Roll back a failed conversion", and "Reconcile an ambiguous conversion" pass.
- Scenario "Fence a Tasks board during conversion" returns a state wholly before or after conversion and fails as one unit after bounded retry exhaustion.
- Transaction lambdas perform no logging, clock reads, ID generation, or external calls.
- Identical retries reuse the supplied Habit and definition IDs without duplicates.

## Task 19: Verify mutation ambiguity, outages, and restart durability

**Status:** pending

**Depends on:** Task 15, Task 18

**Description:**


**Behaviour:** Run cross-family regression coverage for already-implemented ambiguity and outage handling, and prove that browser, service, and database restart retain all saved Tasks, Habits, progress, and history while discarding only unsaved browser drafts.

**Implementation action:** Exercise every mutation family's existing postcondition reader through a common regression matrix without adding missing production behavior here. Verify exact error/trace/redaction behavior, dispatched timeout handling, deterministic-ID reuse, and the shared retry/indeterminate UI already introduced by the mutation slices. Restart the browser harness, Ktor service, and Testcontainers Couchbase node against the same test volume and verify all source-of-truth documents and projections.

**Verification command:** `./gradlew :apps:server:integrationTest --tests 'gytt.server.reliability.*' && npm --prefix apps/web ci && npm --prefix apps/web run test -- --run src/app`

**Acceptance Criteria:**

- Scenario "Reconcile an ambiguous durable mutation" reports success only when the exact requested postcondition is proven.
- Scenario "Treat a durable timeout as ambiguous" passes across single-document and transactional mutations.
- Scenario "Surface database unavailability" returns `503 STORAGE_UNAVAILABLE`, shows no success, and queues no offline change.
- Scenario "Preserve acknowledged data through restart" returns the same Tasks, Habits, progress, and history after browser, service, and database restart; only unsaved drafts are absent.
- `COMMIT_UNKNOWN` requires reload; retries reuse deterministic IDs where applicable.
- Structured logs and counters record stable codes and latency without bodies, titles, details, units, progress, credentials, or secrets.

## Task 20: Harden content and request boundaries

**Status:** pending

**Depends on:** Task 16, Task 17, Task 18

**Description:**


**Behaviour:** Regress every already-implemented content and request-boundary control across the complete application: literal text rendering, exact CSP and Origin behavior, bound SQL++ values, bounded requests, safe errors, and local-only runtime assets.

**Implementation action:** Audit all rendering, adapter, and error call sites against the controls implemented in their owning slices. Add only missing regression cases; do not defer first implementation of sanitization, parameter binding, body/field/range limits, Origin enforcement, or safe problem details to this task. Inspect built asset references as part of the component/build verification; runtime network confinement remains an operator acceptance item.

**Verification command:** `./gradlew :apps:server:test && ./gradlew :apps:server:integrationTest --tests 'gytt.server.couchbase.ParameterizedQueriesTest' && npm --prefix apps/web ci && npm --prefix apps/web run test && npm --prefix apps/web run build`

**Acceptance Criteria:**

- Scenarios "Render user content as text", "Bind every SQL++ value", and "Reject a cross-origin mutation" pass.
- Bodies over 64 KiB return `413 PAYLOAD_TOO_LARGE`; invalid lengths/ranges return the specified `422` error.
- CSP exactly matches the technical specification and has no permissive fallback.
- Generated runtime assets contain no CDN, remote font, analytics, telemetry, or third-party feature URL.
- Errors and logs reveal no database content or secrets.

## Task 21: Complete accessible and responsive frontend behavior

**Status:** pending

**Depends on:** Task 16, Task 17, Task 18

**Description:**


**Behaviour:** Meet the specified keyboard, focus, semantics, labels/errors, announcements, contrast, non-color progress, zoom, phone Tasks board, Dashboard layout, and responsive Habit details behavior. Automated coverage remains at Vitest/Testing Library; real-browser and viewport checks remain operator acceptance.

**Implementation action:** Complete semantic structure and CSS containment, snap-aligned horizontal Task columns, focus return for modal/panel surfaces, visible focus, status announcements, field associations, keyboard Completed section, route-selected panel/full-page rendering, and non-color-only states. Extend the operator checklist for supported browsers, phone width, and 200% zoom without adding Playwright or another browser suite.

**Verification command:** `npm --prefix apps/web ci && npm --prefix apps/web run test && npm --prefix apps/web run build`

**Acceptance Criteria:**

- Scenarios "Use Dashboard at supported responsive sizes", "Use the Tasks board on a phone", and "Open responsive Habit details" are represented in component assertions and the real-browser operator checklist.
- Scenario "Move a Task without dragging" remains green with focus and announcement assertions.
- Modal and panel focus returns to the originating trigger/card.
- The page shell does not overflow horizontally; only the bounded Tasks board region scrolls.
- Keyboard use and 200% zoom retain all controls and information.

## Task 22: Prove bounded query performance

**Status:** pending

**Depends on:** Task 16, Task 17, Task 19

**Description:**


**Behaviour:** Keep each source-owned Dashboard request and one date/period query within the specified 500 ms p95 bound on the home-LAN test profile while using `REQUEST_PLUS`, 10,000 Tasks, 100 Habits, and five years of progress.

**Implementation action:** Add deterministic local scale fixtures, warm-up and measured query runs, percentile reporting, and bounded metrics-range coverage. Tune only the specified filtered secondary indexes and bounded read models; do not add projections, a Dashboard module, primary indexes, or remote infrastructure. If an index must change after the initial migration has been recorded, add a new checksum-verified forward migration with image schema-range and backup/restore compatibility tests; never edit an applied migration.

**Verification command:** `./gradlew :apps:server:integrationTest --tests 'gytt.server.couchbase.PerformanceIndexMigrationTest' :apps:server:performanceTest`

**Acceptance Criteria:**

- Task summary, Habit summary, Task board, Habit period, and allowed metrics queries meet the recorded p95 objective with `REQUEST_PLUS`.
- The SPA-facing queries do not fetch all history for a card or single period.
- Metrics beyond five years return `422` rather than performing unbounded work.
- Any required index remains part of the checksum-verified forward migration and no primary index is introduced.

## Task 23: Finalize private deployment and recovery acceptance

**Status:** pending

**Depends on:** Task 19, Task 20, Task 21, Task 22

**Description:**


**Behaviour:** Execute and record final acceptance of the no-root, secret-mounted, loopback-only application and private Couchbase deployment, including access-boundary behavior, timeout ordering, runtime traffic inspection, browser/service/database restart, backup, compatible image rollback, incompatible-schema restoration, and unrecoverable sole-volume loss.

**Implementation action:** Assemble the already-implemented pinned images, persistent volume, private ports, migration/runtime identities, secret checks, telemetry attestations, and timeout settings into the final deployment without taking ownership away from earlier tasks. Add a deployment smoke script for readiness and same-volume restart. Execute the external-proxy and real-browser checklist, including an induced slow request that proves the actual proxy deadline exceeds Ktor's, private-only traffic capture, browser restart, compatible rollback, and a local backup/restore rehearsal for an incompatible schema. Record the results and make the verification script fail when required evidence is absent. Do not add automated browser or reverse-proxy tests.

**Verification command:** `./deploy/preflight.sh && ./gradlew check :apps:server:integrationTest :apps:server:performanceTest openApiValidate && npm --prefix apps/web ci && npm --prefix apps/web run test && npm --prefix apps/web run build && docker compose build && ./deploy/smoke-deployment.sh && ./deploy/verify-operator-acceptance.sh`

**Acceptance Criteria:**

- The operator checklist executes scenarios "Challenge unauthenticated access", "Serve authenticated access", "Reject an invalid shared credential", "Rate-limit repeated invalid credentials", "Prevent direct application access", and "Keep runtime traffic inside the private boundary".
- The checklist executes scenario "Treat a durable timeout as ambiguous" against the actual proxy/Ktor deadline ordering and records the result.
- Scenario "Block readiness when usage sharing is enabled" remains green through provisioning and readiness checks.
- Scenario "Preserve Local calendar history across time zones" is covered at the capability/component seams and confirmed during operator date navigation.
- Scenario "Preserve acknowledged data through restart" is executed with browser, application, and database restart against the retained volume.
- Deployment preflight rejects any non-loopback application binding or published Couchbase port before containers start.
- Compatible application rollback retains the volume only when the prior image accepts the recorded schema range.
- Incompatible rollback stops GYTT, restores the pre-migration local backup, and starts the prior image; no destructive down migration exists.
- Loss of the sole Couchbase volume is documented as unrecoverable without a local backup.
