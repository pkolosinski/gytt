# GYTT technology

## Technology stack

### Web application

- **Language and UI:** TypeScript, React 19.
- **Build and package management:** Vite, pnpm, Node.js 24 for the container
  build.
- **Routing and server state:** React Router and TanStack Query.
- **Styling and components:** Tailwind CSS with shadcn-based components.
- **Localization:** i18next and react-i18next with local dictionaries.
- **Tests and checks:** Vitest, Testing Library, TypeScript project build, and
  oxlint.
- **Organization:** `apps/web` groups product code by feature. `app/` owns
  bootstrap and routing, `pages/` composes routes, `features/` owns capability
  behavior, and `shared/` contains capability-neutral code. Generated code is
  isolated from handwritten source.

### Server and core

- **Language and runtime:** Kotlin 2.x on JVM 17.
- **HTTP application:** Ktor 3.x.
- **Domain results:** Arrow.
- **Persistence:** Couchbase Server Community, accessed through Couchbase's
  Kotlin/JVM client libraries.
- **Build:** Gradle wrapper, version catalog, and repository convention plugins
  under `build-logic/`.
- **Tests and checks:** Kotest, Testcontainers for Couchbase integration
  coverage, and ktlint.
- **Organization:** `apps/server` owns HTTP and runtime integration. `core/`
  contains separate Task and Habit capability modules and shared persistence
  code. Domain behavior is intended to be independent of Ktor and Couchbase;
  application code supplies transport and persistence integrations.

### Runtime and service boundary

- **Packaging:** Docker multi-stage build produces the web assets and Kotlin
  server artifact, then packages them into a JVM runtime image.
- **Local orchestration:** Docker Compose runs the GYTT server and Couchbase
  Community, with one-shot Couchbase bootstrap before the server starts.
- **Data location:** Couchbase persists to a Compose-managed volume. The
  Compose service network is private and internal.
- **Development exposure:** GYTT and the Couchbase management console bind to
  host loopback. Database data/query services are not published to host/LAN
  ports.
- **Private deployment direction:** Keep the application listener on loopback
  and place a user-operated reverse proxy in front of it when ready. The proxy
  will provide the external HTTPS and shared access boundary; GYTT does not
  implement accounts or sessions.

## Architecture and data boundaries

Tasks and Habits are separate capability owners. Each capability owns its
behavior and data; the Dashboard presents their summaries without owning a
separate copy of either capability's domain state. Day-based Habit occurrences
are composed into the Tasks experience without merging the Tasks and Habits
domains.

The intended request path is browser UI → same-origin HTTP API → Ktor
application boundary → capability facade → persistence adapter. The browser
owns presentation and unsaved drafts, while durable product state belongs to
the server and database. OpenAPI is intended to be the canonical HTTP contract;
the web client is generated from it, and feature-owned adapters translate
transport data for UI use.

The server and database are user-operated components. The current web release
does not use a cloud service, identity provider, telemetry platform, analytics
service, CDN, remotely hosted font, or third-party feature API. Normal use is
not intended to make personal data available outside the private environment.

## Build and run

### Web development

From `apps/web`, install the locked dependencies with pnpm, then use the Vite
development server for local UI work. The web package scripts provide
`pnpm build`, `pnpm typecheck`, `pnpm lint`, and `pnpm test`. The UI currently
uses a mock-backed Tasks data source while server capabilities are being
implemented.

### Server development

Use the repository Gradle wrapper (`./gradlew`) to build and test the Kotlin
server and core modules. The Ktor application listens on port 8080 by default.
Its Couchbase connection is configured through environment variables; local
development defaults are convenience values and are not production secrets.

### Local Compose deployment

Docker Engine with Compose v2 is required. From the repository root, configure
the Couchbase administrator and application credentials in the environment,
validate the Compose configuration, and start the stack with
`docker compose up --build -d`. Compose initializes Couchbase before starting
the server. The current local app is reachable at `http://127.0.0.1:8080`, and
the Couchbase console is bound to `http://127.0.0.1:8091`. These local bindings
are not a production access boundary. The Couchbase data volume must be retained
to preserve saved data; losing the only volume loses the local dataset unless a
separate backup exists.

## Technology constraints and quality goals

- **Private by default:** Bind development services to loopback, keep database
  ports private, avoid external runtime dependencies, and keep credentials and
  personal content out of logs.
- **Responsive and accessible:** Support current desktop browsers and Android
  phone browsers, keyboard and touch operation, semantic markup, visible focus,
  accessible validation, and non-color-only status. The product target is WCAG
  2.2 AA.
- **Durability and consistency:** Acknowledged writes should survive ordinary
  restarts; concurrent edits must not silently overwrite newer data; an
  immediate read should reflect an acknowledged change. Database failures must
  be visible and must not be reported as successful saves.
- **Bounded data access:** Dashboard and date/period reads should query only
  what their views need, so response cost remains controlled as personal
  history grows. The previous design target is a 500 ms 95th percentile for
  summary and date/period reads on a home network at the specified personal
  dataset scale.
- **Single-user operational scope:** The system is designed for one private
  dataset, not high availability or multi-tenant service operation. The
  operator is responsible for host availability and backup/recovery of the
  Couchbase volume.
- **Community-edition limits:** Couchbase Community is the selected storage
  edition. Its operational and licensing characteristics are part of the
  dependency choice and should be reconsidered before changing the deployment
  boundary or use case.

## Technical roadmap

- Complete the Tasks and Habits capability implementations, connect them to
  the Ktor server and Couchbase persistence, and connect the web UI through the
  OpenAPI contract.
- Complete the Dashboard integration over the Tasks- and Habits-owned summary
  interfaces.
- When private deployment is ready, add the user-operated HTTPS reverse-proxy
  boundary in front of the loopback-bound application. The short-form accepted
  decision is in [`decisions/stage-access-boundary.md`](decisions/stage-access-boundary.md).
- Future offline Android work is expected to use Couchbase Lite with a
  self-hosted Sync Gateway connected to Couchbase Server. It will require
  explicit conflict handling, offline persistence, and a safe model for
  operations that affect multiple records. See
  [`decisions/future-couchbase-mobile-sync.md`](decisions/future-couchbase-mobile-sync.md).
- Future product extensions such as meal planning or finance tracking may add
  new capabilities and persistence modules. Their technology and boundaries
  should be decided when those features are explored, rather than assumed now.

## Current implementation state

The web app contains mock-backed Tasks UI and scaffolding for the Dashboard,
Tasks, and Habits areas. The server currently provides application and
Couchbase infrastructure/readiness integration; feature-level API and
persistence behavior is still being implemented. Compose currently packages
the web assets with the server and starts Couchbase Community locally.
