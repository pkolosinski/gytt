export const en = {
    common: {
        cancel: 'Cancel',
        close: 'Close',
        delete: 'Delete',
        dismiss: 'Dismiss',
        edit: 'Edit',
        open: 'Open',
        retry: 'Retry',
        retrying: 'Retrying…',
        today: 'Today',
    },
    app: {
        home: 'GYTT home',
        menu: 'Menu',
        openMenu: 'Open menu',
        collapseSidebar: 'Collapse sidebar',
        expandSidebar: 'Expand sidebar',
        preferences: 'Preferences',
        darkTheme: 'Dark theme',
        language: 'Language',
        sections: {
            dashboard: 'Dashboard',
            tasks: 'Tasks',
            habits: 'Habits',
        },
    },
    dashboard: {
        eyebrow: 'Get Your Things Together',
        title: 'Make today count.',
        subtitle: 'A calm place for the things you want to do and keep doing.',
        modulesLabel: 'GYTT modules',
        today: 'Today',
        modules: {
            tasks: {
                title: 'Tasks',
                description: 'Plan, organize, and complete your daily work.',
                prompt: 'Turn your plans into a clear next step.',
                openLabel: 'Open tasks',
            },
            habits: {
                title: 'Habits',
                description: 'Build consistency with daily, weekly, and monthly habits.',
                prompt: 'Keep the routines that matter moving forward.',
                openLabel: 'Open habits',
            },
        },
    },
    placeholder: {
        badge: 'Placeholder',
        cardTitle: 'Workspace coming next',
        cardDescription: 'The route is connected and ready for the next implementation slice.',
        ready: '{{module}} navigation is ready.',
        notIncluded: 'Domain behavior and saved data are not part of this placeholder.',
        backToDashboard: 'Back to dashboard',
    },
    habits: {
        title: 'Habits',
        description:
            'Your daily, weekly, and monthly habit views will help you keep the routines that matter.',
    },
    tasks: {
        title: 'Tasks',
        newTask: 'New task',
        notMovedTitle: 'Task not moved',
        status: {
            todo: 'To do',
            inProgress: 'In progress',
            completed: 'Completed',
        },
        navigation: {
            label: 'Task dates',
            previousDay: 'Previous day',
            nextDay: 'Next day',
            goToDate: 'Go to date',
        },
        dateNotFound: {
            heading: 'Date not found',
            title: 'This is not a calendar date',
            description: '“{{value}}” is not a valid date in YYYY-MM-DD form.',
            dashboard: 'Dashboard',
            todaysTasks: 'Today’s tasks',
        },
        boardError: {
            title: 'Tasks board unavailable',
            description:
                'The local service could not load this date. Nothing on the board has changed.',
        },
        board: {
            label: 'Task board',
            loading: 'Loading tasks',
            fallbackTitle: 'Task',
            noColumn: 'no column',
            dragStart: 'Picked up “{{title}}”.',
            dragOver: '“{{title}}” is over {{column}}.',
            dragEnd: '“{{title}}” was dropped in {{column}}.',
            dropOutside: '“{{title}}” was dropped outside the columns and did not move.',
            dragCancel: 'Moving “{{title}}” was cancelled.',
            instructions: 'Open Task details to change its status.',
        },
        column: {
            count: '{{count}} in {{status}}',
            create: 'Create',
            createIn: 'Create task in {{status}}',
        },
        card: {
            since: 'Since {{date}}',
        },
        statusMenu: {
            trigger: '{{status}}: move “{{title}}”',
            moveTo: 'Move to',
        },
        moves: {
            moved: 'Moved “{{title}}” to {{status}}.',
            conflict:
                '“{{title}}” changed elsewhere, so it was not moved. The board now shows its latest status.',
            invalid: '“{{title}}” was not moved. {{reason}}',
            unavailable:
                '“{{title}}” could not be moved because the local service did not respond. Try again.',
        },
        modal: {
            createTitle: 'Create new task',
            taskTitle: 'Task',
            editTitle: 'Edit task',
            loading: 'Loading task…',
            unavailableTitle: 'Task unavailable',
            unavailableDescription: 'The task could not be loaded from the local service.',
            description: 'Description:',
            deleteTitle: 'Delete task?',
            deleteDescription: 'Permanently delete “{{title}}”? This action cannot be undone.',
            deleteTask: 'Delete task',
            deleting: 'Deleting…',
            notDeletedTitle: 'Task not deleted',
            deleteConflict:
                'This task changed elsewhere, so it was not deleted. The board now shows its latest status. Try again.',
            deleteNotFound: 'This task no longer exists.',
            deleteUnavailable: 'The local service could not delete the task. Try again.',
        },
        editor: {
            conflictTitle: 'This task changed elsewhere',
            conflictDescription:
                'A newer saved version replaced your edit. Review it and save again if needed.',
            reloadFailedTitle: 'Task changed elsewhere',
            reloadFailedDescription:
                'A newer version exists, but it could not be loaded. Your draft was kept; try again later.',
            notSavedTitle: 'Task not saved',
            draftKept: '{{detail}} Your draft was kept.',
            saveUnavailable: 'The local service could not save the task.',
            title: 'Title',
            description: 'Description',
            optional: '(optional)',
            saving: 'Saving…',
            create: 'Create task',
            save: 'Save changes',
        },
        validation: {
            titleRequired: 'Enter a title.',
            tooLong: 'Use at most {{max}} characters.',
            startDateInvalid: 'Choose a valid start date.',
        },
    },
};

/** The shape every language dictionary must match exactly. */
export type Dictionary = typeof en;
