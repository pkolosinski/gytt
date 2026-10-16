# GYTT product

## What GYTT is for

GYTT (Get Your Things Together) is a private, single-user life-organization
product for daily tasks and habit consistency. It brings one-off work and
recurring behavior into one practical tool, reducing the effort of maintaining
separate applications and avoiding fragmentation between deciding what to do
and building routines.

GYTT is for one person organizing their own everyday responsibilities and
personal routines. It is designed to run in an environment operated by that
person—initially on the development machine and, when ready, in the user's home
environment. The product is not a hosted multi-user service.

## Product goal

The first useful release should support a repeatable daily loop:

1. See what needs attention today.
2. Work through one-off tasks and record progress.
3. Carry flexible unfinished work forward without losing its history.
4. Complete scheduled habit work alongside daily tasks where appropriate.
5. Review habit consistency and progress over day, week, and month periods.

The Dashboard is the compact entry point to the Tasks and Habits areas. Tasks
and Habits remain separate capabilities, but connect where that helps the daily
workflow: day-based habit occurrences can be acted on from the Tasks view, and
a task can be used as the starting point for a habit.

## Product requirements

The initial product should provide the following capabilities and qualities:

- **Responsive web experience:** Support everyday use on desktop and phone
  browsers within the user's private environment.
- **Dashboard:** Give the user an at-a-glance view of today's task and habit
  progress, with direct navigation into Tasks and Habits.
- **Tasks:** Support flexible tasks that remain active across dates and tasks
  assigned to a particular day. Let the user record a small set of progress
  states, review past work, and use optional checklists for multi-step tasks.
- **Habits:** Support recurring schedules for every day, selected weekdays,
  once per week, or once per calendar month. Support simple completion and
  numeric progress targets.
- **History:** Let the user review and correct past task and habit activity.
  Changes to a habit's schedule or target must not erase the meaning of earlier
  periods. Habits can be archived while retaining their history.
- **Connected daily workflow:** Keep scheduled day-based habit occurrences
  consistent between the Tasks and Habits views. Allow a task to be converted
  into a habit when the user wants to turn completed work into a recurring
  routine.
- **Usable interaction:** Make core actions understandable and accessible by
  keyboard and touch as well as pointer. Use responsive layouts and meaningful
  semantics; accessibility and progress must not depend solely on color or
  drag-and-drop.
- **Durable personal data:** Saved tasks, habits, progress, and history should
  survive normal browser and service restarts.
- **Graceful local failures:** When a local service is unavailable, show the
  failure clearly rather than presenting unsaved work as saved. The first web
  release does not promise offline operation or queue offline edits.

These are product-level requirements, not detailed acceptance scenarios or a
screen-by-screen specification. Current implementation status is described in
[`technology.md`](technology.md).

## Privacy and product constraints

- GYTT has one user and one private dataset. Accounts, family accounts, shared
  spaces, resource sharing, and per-record permissions are outside the initial
  product.
- Personal and usage data stays on the user's devices and within the
  user-operated environment. GYTT must not rely on a hosted identity provider,
  analytics, third-party telemetry, external feature APIs, or remotely hosted
  runtime assets.
- The current browser experience requires the user's server/environment to be
  reachable. Local-first describes ownership and location of data; it does not
  mean the current web app works offline.
- Development access is localhost-only. A user-operated reverse proxy is the
  planned access boundary when the private deployment is ready.
- GYTT is not intended to replace a calendar, project-management system,
  general-purpose notes or knowledge-management tool, or health application.
- The initial Tasks capability does not include priorities, deadlines,
  time-of-day scheduling, task recurrence, tags, categories, projects,
  attachments, a separate inbox/backlog, or independent/nested child tasks.
- The initial Habits capability focuses on binary and numeric progress. Timers,
  reminders, notifications, and arbitrary custom progress controls are out of
  scope.

## Planned product extensions

The first release focuses on Tasks and Habits. Possible future extensions,
subject to future product decisions, include:

- Meal planning, recipes, and shopping lists.
- Personal finance tracking.
- Family-oriented use and multiple users.
- Native mobile access, including offline use and synchronization.

These are directions, not commitments or current capabilities. Any extension
must preserve the private, user-controlled product boundary or explicitly
revisit it with the user.

## Current product state

GYTT is under active development. The web app has application scaffolding and a
mock-backed Tasks experience. Persistent Tasks and Habits product behavior and
their server/API integration remain in development.
