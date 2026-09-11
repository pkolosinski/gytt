# Repository structure

- `apps/` contains deployable application boundaries such as the server and
  web application.
- `core/` coordinates capability modules such as `habits` and `tasks`; each
  capability owns its production behavior.
- `build-logic/` contains Gradle convention plugins and build configuration
  only.
- `docs/` contains product and technical specifications, ADRs, operations
  guidance, and acceptance records.
- Applications may depend on `core`; `core` must not depend on applications.
- Keep framework, transport, persistence, configuration, and other I/O at the
  application boundary.
