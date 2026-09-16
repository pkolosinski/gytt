# CHG-001: GYTT Daily Organization MVP

## Goal / Scope

Create the first useful release of Get Your Things Together (GYTT): a private, single-user life-organization product focused on daily tasks and habit consistency.

The MVP provides a responsive web experience for phones and desktops within the user's home environment. It includes a Dashboard experience backed by the Tasks and Habits capabilities. Tasks and habits remain distinct but connected: day-based habit occurrences are actionable from the Tasks view, and an existing task can become a habit.

All personal and usage data must remain within the user's devices and user-operated home environment. The product must not depend on external identity providers, telemetry, analytics, third-party feature APIs, or remotely hosted runtime assets.

## Rationale

The user currently needs separate tools to manage one-off work and recurring behavior. Those tools increase maintenance effort, fragment related workflows, and require trusting external applications or services with personal data.

GYTT establishes one trusted place for daily organization while preserving clear module boundaries. The first release concentrates on Tasks and Habits because they form an independently useful daily loop: decide what needs attention, record progress, carry unfinished flexible work forward, and review consistency over time. The product can later extend that connected model to meal planning, finances, family use, and mobile access.

## Current Behaviour (As-Is State)

This is greenfield work. No GYTT application or existing task-and-habit capability exists yet.

## Change Delta

The change introduces a private web product with one shared dataset protected by one local access credential. The Dashboard independently presents summaries owned by Tasks and Habits. The Tasks capability manages standard work and its effective-dated workflow by date, while the Habits capability manages recurring binary or numeric targets and their historical performance. Shared day-based habit occurrences keep the two views consistent without combining the capabilities.

Acceptance conditions:

- A user can enter the shared local credential through the browser's HTTP Basic Auth prompt without using an external identity provider.
- An authenticated user can use the web product on phone-sized and desktop-sized screens within the home environment.
- The Dashboard starts with a static, non-personalized greeting.
- The Dashboard provides links to the Tasks and Habits modules.
- The Dashboard loads the Tasks and Habits summaries through separate requests.
- If one Dashboard summary request fails, the other successful card remains visible and the failed card can be retried independently.
- The Dashboard Tasks card shows separate completed and remaining counts for today's standard Tasks.
- Habit occurrences are excluded from the Dashboard Tasks card counts.
- The Dashboard Habits card shows today's progress as the percentage of today's scheduled habit occurrences that are completed.
- The Dashboard Habits card lists today's scheduled habit occurrences that are not yet completed.
- The Tasks module opens on the current device-local date and allows navigation to any other date.
- The Tasks view is a three-column board containing To do, In progress, and Completed.
- The Tasks board loads standard Tasks and due daily or selected-day Habit occurrences through one composite request; the whole board fails visibly if either capability query fails.
- Standard Tasks and Habit occurrences share the same board columns but may use visually distinct cards.
- An empty Tasks board retains its three column headers and renders no explanatory placeholder.
- On phone widths, the three Tasks columns remain side by side in a horizontally scrollable board region.
- The user can create and edit an anytime task with a title, optional details, and a start day.
- A new anytime task defaults its start day to the current device-local date.
- The user can set an anytime task's start day to a future device-local date.
- An anytime task defaults to To do and appears on every active date from its start day.
- A standard task can move between To do, In progress, and Completed in any direction using drag-and-drop or an equivalent keyboard-accessible action.
- Standard task status transitions are effective-dated so earlier boards retain the state that applied on their date.
- Completing an anytime task places it in Completed on that date and removes it from later boards unless a later transition reopens it.
- Backdating an anytime task's completion before an existing completion warns that later status logs will be removed and requires confirmation before removing them.
- The user can create and edit a fixed-day task with a title, optional details, and a scheduled day.
- A fixed-day task appears in the Tasks view only on its scheduled day.
- A Fixed-day Task does not appear on later days and does not create an overdue alert regardless of its status.
- A Fixed-day Task's details and status remain editable in its scheduled day's history.
- The user can manually copy a non-completed Fixed-day Task to create another Task.
- There is no separate task inbox or backlog.
- Selecting any Tasks-board card opens one modal. For a standard Task it supports details, create/edit, copy, conversion, and deletion actions.
- A Habit-task modal shows simple occurrence details and links to the corresponding Habits period view.
- Habit-task progress is editable inline on its Tasks-board card.
- Completed standard Tasks remain visible in the board's Completed column for the viewed date.
- Completed and past Fixed-day Tasks remain available in navigable date history.
- The user can permanently delete a task after confirming the deletion.
- The user can transform a task into a new habit prefilled from that task.
- Transforming a task into a habit marks the original task completed and leaves a visible reference to the new habit.
- Backdating a task-to-habit conversion before a later completion requires the same confirmation and later-status-log removal as backdating completion directly.
- The user can create a habit scheduled daily.
- The user can create a habit scheduled on selected days of the week.
- The user can create a habit with one occurrence that may be completed at any time during each Monday-based week.
- The user can create a habit with one occurrence that may be completed at any time during each calendar month.
- A habit can use a binary target with done and not-done progress.
- A habit can use a numeric target with an optional unit.
- The user can increment, decrement, or directly edit accumulated progress for a numeric habit.
- Habit progress is editable inline in the Habits period list.
- Numeric habit progress can exceed its target and displays the resulting percentage above 100%.
- Habit occurrence progress distinguishes untouched, partially done, and done states.
- An incomplete habit occurrence becomes missed after its device-local day, week, or month ends.
- The user can correct progress on a past habit occurrence.
- A day-based habit occurrence appears in the Tasks view only on its scheduled day.
- Weekly and monthly habit occurrences do not appear in the Tasks view.
- Editing a day-based habit occurrence in the Tasks view immediately produces the same progress in the Habits view.
- Editing a day-based habit occurrence in the Habits view immediately produces the same progress in the Tasks view.
- Completed habit occurrences remain visible in a collapsible Completed section for the viewed period.
- Habit period views default to the current day, week, or month and allow navigation to past and future periods.
- Habit creation opens a modal without changing the URL.
- Selecting a Habit opens details and edit behavior in a route-backed side panel on wide screens and the same route as a full page on narrow screens.
- The Habit panel route retains the originating period in its path.
- Habit completion rate equals the percentage of expected occurrences whose targets were fully met.
- For a single numeric habit, target attainment equals its total recorded progress divided by its total expected target for the selected period and is not capped at 100%.
- The user can apply a habit schedule or target change from a chosen effective date.
- Applying a habit schedule or target change does not alter earlier occurrences or their historical metrics.
- The user can archive a habit from a chosen date without deleting its history.
- An archived habit produces no occurrences on or after its archive date.
- A habit can be permanently deleted only before it has occurrence history.
- "Today" follows the current device's local calendar date.
- Habit weeks begin on Monday, and habit months follow calendar months.
- Changing a device's time zone does not rewrite existing task or habit history.
- Restarting the browser and the GYTT service does not lose saved tasks, habits, progress, or history.
- Personal data and usage data do not leave the user's devices or user-operated home environment.
- The product sends no telemetry or analytics to third parties.
- Core Tasks and Habits behavior makes no requests to third-party feature APIs.
- The product loads no remotely hosted runtime assets.

## Non-Goals

- Meal planning, recipes, and shopping lists.
- Finance tracking for expenses or savings.
- Habit actions linked to meal-planning or finance workflows.
- Family accounts, multiple users, personal or shared spaces, permissions, and resource sharing.
- Native Android support, offline operation, synchronization after offline edits, and conflict resolution.
- iOS support.
- Access to the web product when the user-operated home environment is unreachable.
- External service integrations.
- Reminders and notifications.
- Timers or custom habit progress controls beyond binary and numeric entry.
- Task priorities, deadlines, time-of-day scheduling, recurrence, tags, categories, subtasks, attachments, projects, or a backlog.
- Calendar replacement, general notes or knowledge management, project management, health tracking, file storage, or general AI coaching.
