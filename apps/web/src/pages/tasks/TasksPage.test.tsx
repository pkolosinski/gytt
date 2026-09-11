// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppRouter } from '@/app/router.tsx';
import {
    createMockTasksApi,
    TaskApiError,
    tasksApi,
    type TaskRecordView,
    type TasksApi,
} from '@/features/tasks/index.ts';

function LocationProbe() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname}</output>;
}

function stubTasksApi(source: TasksApi) {
    vi.spyOn(tasksApi, 'getBoard').mockImplementation(source.getBoard);
    vi.spyOn(tasksApi, 'getTask').mockImplementation(source.getTask);
    vi.spyOn(tasksApi, 'createTask').mockImplementation(source.createTask);
    vi.spyOn(tasksApi, 'updateTask').mockImplementation(source.updateTask);
    vi.spyOn(tasksApi, 'moveTask').mockImplementation(source.moveTask);
    vi.spyOn(tasksApi, 'deleteTask').mockImplementation(source.deleteTask);
}

function renderTasks(path: string, source: TasksApi = createMockTasksApi()) {
    stubTasksApi(source);
    const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <AppRouter />
                <LocationProbe />
            </MemoryRouter>
        </QueryClientProvider>,
    );
    return { source, user: userEvent.setup() };
}

function anytimeTask(overrides: Partial<TaskRecordView> = {}): TaskRecordView {
    return {
        convertedHabitId: null,
        details: null,
        fixedDate: null,
        id: '11111111-2222-4333-8444-555555555555',
        latestStatus: 'todo',
        latestStatusEffectiveDate: '2026-09-02',
        startDate: '2026-09-02',
        title: 'Water the plants',
        type: 'anytime',
        version: '1',
        ...overrides,
    };
}

function currentPath() {
    return screen.getByTestId('location').textContent;
}

function column(name: string) {
    // The board stays in the DOM, but is hidden from assistive technology while the modal is open.
    return screen.getByRole('list', { hidden: true, name });
}

async function waitForBoard() {
    const board = await screen.findByRole('region', { name: 'Task board' });
    await waitFor(() => expect(board.getAttribute('aria-busy')).toBe('false'));
    return board;
}

function setDate(element: HTMLElement, value: string) {
    fireEvent.change(element, { target: { value } });
}

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 3, 10, 0, 0));
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe('Tasks routes and navigation', () => {
    it('opens on the device Today and navigates to exact dates', async () => {
        const { user } = renderTasks('/tasks');

        await waitFor(() => expect(currentPath()).toBe('/tasks/2026-09-03'));
        await waitForBoard();
        expect(screen.getByText('· Today')).toBeTruthy();

        await user.click(screen.getByRole('link', { name: 'Previous day' }));
        expect(currentPath()).toBe('/tasks/2026-09-02');
        await user.click(screen.getByRole('link', { name: 'Previous day' }));
        expect(currentPath()).toBe('/tasks/2026-09-01');
        expect(screen.getByLabelText('Go to date')).toHaveProperty('value', '2026-09-01');

        setDate(screen.getByLabelText('Go to date'), '2026-09-05');
        expect(currentPath()).toBe('/tasks/2026-09-05');
        expect(screen.queryByText('· Today')).toBeNull();

        await user.click(screen.getByRole('link', { name: 'Today' }));
        expect(currentPath()).toBe('/tasks/2026-09-03');
    });

    it.each(['/tasks/2026-02-30', '/tasks/2026-9-3', '/tasks/20260903', '/tasks/today'])(
        'shows a not-found state for %s without normalizing it',
        (path) => {
            renderTasks(path);
            const page = within(screen.getByRole('main'));

            expect(page.getByRole('heading', { name: 'Date not found' })).toBeTruthy();
            expect(currentPath()).toBe(path);
            expect(page.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/');
            expect(page.getByRole('link', { name: 'Today’s tasks' }).getAttribute('href')).toBe(
                '/tasks',
            );
            expect(screen.queryByRole('region', { name: 'Task board' })).toBeNull();
        },
    );
});

describe('Tasks board', () => {
    it('keeps an empty board structurally stable', async () => {
        renderTasks('/tasks/2026-09-03');
        await waitForBoard();

        for (const name of ['To do', 'In progress', 'Completed']) {
            expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
            const list = column(name);
            expect(list.children).toHaveLength(0);
            expect(list.textContent).toBe('');
            expect(screen.getByRole('button', { name: `Create task in ${name}` })).toBeTruthy();
        }
        expect(screen.getByRole('button', { name: 'New task' })).toBeTruthy();
    });

    it('keeps headings and create actions in place while the board loads', async () => {
        renderTasks('/tasks/2026-09-03', createMockTasksApi({ delayMs: 50 }));

        const board = await screen.findByRole('region', { name: 'Task board' });
        expect(board.getAttribute('aria-busy')).toBe('true');
        expect(within(board).getByRole('status').textContent).toBe('Loading tasks');
        for (const name of ['To do', 'In progress', 'Completed']) {
            expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
            expect(screen.getByRole('button', { name: `Create task in ${name}` })).toBeTruthy();
        }
        await waitForBoard();
        expect(within(board).queryByRole('status')).toBeNull();
    });

    it('carries an Anytime task through its active interval', async () => {
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        const { user } = renderTasks('/tasks/2026-09-01', source);

        await waitForBoard();
        expect(screen.queryByText('Water the plants')).toBeNull();

        await user.click(screen.getByRole('link', { name: 'Next day' }));
        await waitForBoard();
        expect(await within(column('To do')).findByText('Water the plants')).toBeTruthy();

        await user.click(screen.getByRole('link', { name: 'Next day' }));
        expect(await within(column('To do')).findByText('Water the plants')).toBeTruthy();
        expect(within(column('To do')).getByText(/^Since /)).toBeTruthy();
    });

    it('renders all task cards at a consistent height', async () => {
        const source = createMockTasksApi({
            tasks: [
                anytimeTask(),
                anytimeTask({
                    details: 'A long description. '.repeat(200),
                    id: '22222222-3333-4444-8555-666666666666',
                    title: 'A long task title '.repeat(12),
                }),
            ],
        });
        renderTasks('/tasks/2026-09-03', source);
        await waitForBoard();

        const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-task-id]'));
        expect(cards).toHaveLength(2);
        expect(cards.every((card) => card.classList.contains('h-28'))).toBe(true);
        expect(cards[1]?.querySelector('button')?.classList.contains('text-base')).toBe(true);
        expect(cards[1]?.querySelector('p')?.classList.contains('text-sm')).toBe(true);
    });

    it('replaces the whole board with one retryable error when the board read fails', async () => {
        const mock = createMockTasksApi({ tasks: [anytimeTask()] });
        let failures = 1;
        const source: TasksApi = {
            ...mock,
            getBoard: (date) => {
                if (failures > 0) {
                    failures -= 1;
                    return Promise.reject(
                        new TaskApiError('STORAGE_UNAVAILABLE', 'Storage is unavailable.'),
                    );
                }
                return mock.getBoard(date);
            },
        };
        const { user } = renderTasks('/tasks/2026-09-03', source);

        const alert = await screen.findByRole('alert');
        expect(within(alert).getByText('Tasks board unavailable')).toBeTruthy();
        expect(screen.queryByRole('region', { name: 'Task board' })).toBeNull();
        expect(screen.queryByText('Water the plants')).toBeNull();

        await user.click(within(alert).getByRole('button', { name: 'Retry' }));

        expect(await within(column('To do')).findByText('Water the plants')).toBeTruthy();
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('renders user content as literal text', async () => {
        const markup = '<img src=x onerror="alert(1)">';
        const source = createMockTasksApi({
            tasks: [anytimeTask({ details: '<script>alert(2)</script>', title: markup })],
        });
        const { user } = renderTasks('/tasks/2026-09-03', source);

        const card = await within(column('To do')).findByRole('button', {
            name: markup,
        });
        expect(card.textContent).toContain(markup);
        expect(document.querySelector('img')).toBeNull();

        await user.click(card);
        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByRole('heading', { name: markup })).toBeTruthy();
        expect(within(dialog).getByText('<script>alert(2)</script>')).toBeTruthy();
        expect(document.querySelector('img')).toBeNull();
        expect(document.querySelector('dialog script, [role="dialog"] script')).toBeNull();
    });
});

describe('Anytime task editor', () => {
    it('creates an Anytime task with the default start', async () => {
        vi.setSystemTime(new Date(2026, 8, 2, 9, 0, 0));
        const { source, user } = renderTasks('/tasks/2026-09-02');
        await waitForBoard();

        await user.click(screen.getByRole('button', { name: 'New task' }));
        const dialog = await screen.findByRole('dialog', { name: 'Create new task' });
        expect(within(dialog).getByLabelText('Title')).toBeTruthy();
        expect(within(dialog).getByLabelText('Description (optional)')).toBeTruthy();
        expect(within(dialog).queryByLabelText('Start date')).toBeNull();
        expect(within(dialog).queryByLabelText('Status')).toBeNull();

        await user.type(within(dialog).getByLabelText('Title'), 'Call the plumber');
        await user.type(
            within(dialog).getByLabelText('Description (optional)'),
            'Call after 5 p.m.',
        );
        await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(await within(column('To do')).findByText('Call the plumber')).toBeTruthy();
        const board = await source.getBoard('2026-09-02');
        expect(board.todo).toHaveLength(1);
        expect(board.todo[0].task).toMatchObject({
            details: 'Call after 5 p.m.',
            startDate: '2026-09-02',
            status: 'todo',
            type: 'anytime',
        });
        expect(board.todo[0].task.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );

        await user.click(within(column('To do')).getByRole('button', { name: 'Call the plumber' }));
        const details = await screen.findByRole('dialog', { name: 'Call the plumber' });
        expect(details.textContent).toContain('Description: Call after 5 p.m.');
        expect(
            within(details).getByRole('button', { name: 'To do: move “Call the plumber”' }),
        ).toBeTruthy();
        expect(within(details).queryByText('Anytime')).toBeNull();
        expect(within(details).queryByText('Start date')).toBeNull();
    });

    it.each([
        ['To do', 'todo'],
        ['In progress', 'inProgress'],
        ['Completed', 'completed'],
    ] as const)('creates a task in the %s column status', async (name, status) => {
        vi.setSystemTime(new Date(2026, 8, 2, 9, 0, 0));
        const { source, user } = renderTasks('/tasks/2026-09-02');
        await waitForBoard();

        await user.click(screen.getByRole('button', { name: `Create task in ${name}` }));
        const dialog = await screen.findByRole('dialog', { name: 'Create new task' });
        expect(within(dialog).queryByLabelText('Status')).toBeNull();

        await user.type(within(dialog).getByLabelText('Title'), 'Sort the mail');
        await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(await within(column(name)).findByText('Sort the mail')).toBeTruthy();
        expect(
            within(column(name)).queryByRole('button', {
                name: `${name}: move “Sort the mail”`,
            }),
        ).toBeNull();
        const board = await source.getBoard('2026-09-02');
        expect(board[status]).toHaveLength(1);
        expect(board[status][0].task).toMatchObject({
            details: null,
            status,
            statusEffectiveDate: '2026-09-02',
        });

        await user.click(within(column(name)).getByRole('button', { name: 'Sort the mail' }));
        const details = await screen.findByRole('dialog', { name: 'Sort the mail' });
        const statusButton = within(details).getByRole('button', {
            name: `${name}: move “Sort the mail”`,
        });
        const editButton = within(details).getByRole('button', { name: 'Edit' });
        const deleteButton = within(details).getByRole('button', { name: 'Delete' });
        expect(editButton.parentElement?.parentElement).toBe(statusButton.parentElement);
        expect(deleteButton.parentElement).toBe(editButton.parentElement);
        expect(editButton.parentElement?.className.split(/\s+/)).toContain('ml-auto');
        expect(
            statusButton.compareDocumentPosition(editButton) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            editButton.compareDocumentPosition(deleteButton) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(statusButton.className.split(/\s+/)).toContain('h-8');
        expect(editButton.className.split(/\s+/)).toContain('h-8');
        expect(within(details).queryByText('Anytime')).toBeNull();
        expect(within(details).queryByText('Start date')).toBeNull();
        expect(within(details).queryByText('Description:')).toBeNull();
    });

    it('moves a task from its details dialog using its status menu', async () => {
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        await waitForBoard();

        await user.click(
            await within(column('To do')).findByRole('button', { name: 'Water the plants' }),
        );
        const details = await screen.findByRole('dialog', { name: 'Water the plants' });
        await user.click(
            within(details).getByRole('button', { name: 'To do: move “Water the plants”' }),
        );
        await user.click(await screen.findByRole('menuitemradio', { name: 'In progress' }));

        expect(
            await within(details).findByRole('button', {
                name: 'In progress: move “Water the plants”',
            }),
        ).toBeTruthy();
        expect(await within(column('In progress')).findByText('Water the plants')).toBeTruthy();
        expect(within(column('To do')).queryByText('Water the plants')).toBeNull();
        expect((await source.getBoard('2026-09-03')).inProgress).toHaveLength(1);

        await user.click(within(details).getByRole('button', { name: 'Close' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(await within(column('In progress')).findByText('Water the plants')).toBeTruthy();
        expect(within(column('To do')).queryByText('Water the plants')).toBeNull();
    });

    it('keeps the draft and associates messages with fields when validation fails', async () => {
        const { source, user } = renderTasks('/tasks/2026-09-03');
        await waitForBoard();

        await user.click(screen.getByRole('button', { name: 'New task' }));
        const dialog = await screen.findByRole('dialog', { name: 'Create new task' });
        await user.type(within(dialog).getByLabelText('Title'), '   ');
        await user.type(within(dialog).getByLabelText(/Description/), 'Keep this draft');
        await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

        const title = within(dialog).getByLabelText('Title');
        expect(title.getAttribute('aria-invalid')).toBe('true');
        const errorId = title.getAttribute('aria-describedby');
        expect(errorId).not.toBeNull();
        expect(document.getElementById(errorId ?? '')?.textContent).toBe('Enter a title.');
        expect(document.activeElement).toBe(title);
        expect(within(dialog).getByLabelText(/Description/)).toHaveProperty(
            'value',
            'Keep this draft',
        );
        expect((await source.getBoard('2026-09-03')).todo).toHaveLength(0);
        expect((await source.getBoard('2026-09-04')).todo).toHaveLength(0);
    });

    it('edits an Anytime task without creating a duplicate', async () => {
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        const { user } = renderTasks('/tasks/2026-09-03', source);

        await user.click(
            await within(column('To do')).findByRole('button', { name: 'Water the plants' }),
        );
        const dialog = await screen.findByRole('dialog', { name: 'Water the plants' });
        await user.click(within(dialog).getByRole('button', { name: 'Edit' }));
        expect(within(dialog).queryByLabelText('Status')).toBeNull();
        expect(within(dialog).queryByLabelText('Start date')).toBeNull();

        const title = within(dialog).getByLabelText('Title');
        await user.clear(title);
        await user.type(title, 'Water the balcony plants');
        await user.type(within(dialog).getByLabelText(/Description/), 'Use the rain barrel.');
        await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

        expect(
            await screen.findByRole('dialog', { name: 'Water the balcony plants' }),
        ).toBeTruthy();
        expect(await within(column('To do')).findByText('Water the balcony plants')).toBeTruthy();
        expect(within(column('To do')).getAllByRole('listitem', { hidden: true })).toHaveLength(1);
        expect(await source.getTask(anytimeTask().id)).toMatchObject({
            details: 'Use the rain barrel.',
            startDate: '2026-09-02',
            title: 'Water the balcony plants',
            version: '2',
        });
    });

    it('reloads a Task by ID after a version conflict and drops it from the board', async () => {
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        const { user } = renderTasks('/tasks/2026-09-03', source);

        await user.click(
            await within(column('To do')).findByRole('button', { name: 'Water the plants' }),
        );
        const dialog = await screen.findByRole('dialog', { name: 'Water the plants' });
        await user.click(within(dialog).getByRole('button', { name: 'Edit' }));
        await user.type(within(dialog).getByLabelText('Title'), ' today');

        await source.updateTask(
            anytimeTask().id,
            {
                details: null,
                id: anytimeTask().id,
                startDate: '2026-09-10',
                title: 'Water the garden',
                type: 'anytime',
            },
            '1',
        );
        await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

        expect(await within(dialog).findByText('This task changed elsewhere')).toBeTruthy();
        expect(within(dialog).getByLabelText('Title')).toHaveProperty('value', 'Water the garden');
        expect(within(dialog).queryByLabelText('Start date')).toBeNull();
        await waitFor(() => expect(within(column('To do')).queryByText(/Water the/)).toBeNull());
        expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeTruthy();
        expect((await source.getTask(anytimeTask().id)).title).toBe('Water the garden');
    });
});

describe('Task details actions', () => {
    it('confirms deletion and removes the task from every board date', async () => {
        const task = anytimeTask();
        const source = createMockTasksApi({ tasks: [task] });
        const { user } = renderTasks('/tasks/2026-09-03', source);

        await user.click(await within(column('To do')).findByRole('button', { name: task.title }));
        const details = await screen.findByRole('dialog', { name: task.title });
        const deleteButton = within(details).getByRole('button', { name: 'Delete' });

        await user.click(deleteButton);
        const confirmation = await screen.findByRole('alertdialog', { name: 'Delete task?' });
        expect(confirmation.textContent).toContain(task.title);
        await user.click(within(confirmation).getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByRole('alertdialog')).toBeNull();
        expect((await source.getBoard('2026-09-03')).todo).toHaveLength(1);

        await user.click(within(details).getByRole('button', { name: 'Delete' }));
        const confirmedDialog = await screen.findByRole('alertdialog', { name: 'Delete task?' });
        await user.click(within(confirmedDialog).getByRole('button', { name: 'Delete task' }));

        await waitFor(() => expect(screen.queryByRole('dialog', { name: task.title })).toBeNull());
        expect(within(column('To do')).queryByText(task.title)).toBeNull();
        expect((await source.getBoard('2026-09-03')).todo).toHaveLength(0);
        await expect(source.getTask(task.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });
        await expect(source.deleteTask(task.id, task.version)).resolves.toBeUndefined();
        await expect(
            source.createTask(
                {
                    details: task.details,
                    id: task.id,
                    startDate: task.startDate,
                    title: task.title,
                    type: task.type,
                },
                'todo',
            ),
        ).rejects.toMatchObject({ code: 'ID_REUSED' });
    });

    it('keeps the task and reports an error when deletion conflicts', async () => {
        const task = anytimeTask();
        const source = createMockTasksApi({ tasks: [task] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        vi.spyOn(tasksApi, 'deleteTask').mockRejectedValue(
            new TaskApiError('VERSION_CONFLICT', 'A newer version of this Task exists.'),
        );

        await user.click(await within(column('To do')).findByRole('button', { name: task.title }));
        const details = await screen.findByRole('dialog', { name: task.title });
        await user.click(within(details).getByRole('button', { name: 'Delete' }));
        const confirmation = await screen.findByRole('alertdialog', { name: 'Delete task?' });
        await user.click(within(confirmation).getByRole('button', { name: 'Delete task' }));

        const alert = await within(confirmation).findByRole('alert');
        expect(alert.textContent).toContain('changed elsewhere');
        expect(await within(column('To do')).findByText(task.title)).toBeTruthy();
        expect((await source.getBoard('2026-09-03')).todo).toHaveLength(1);
    });
});

describe('Moving tasks', () => {
    const statusChip = (name: string) =>
        screen.getByRole('button', { name: new RegExp(`^${name}: move “Water the plants”$`) });

    it('moves a task with its details status chip on the viewed date and keeps focus', async () => {
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        await user.click(
            await within(column('To do')).findByRole('button', { name: 'Water the plants' }),
        );
        const details = await screen.findByRole('dialog', { name: 'Water the plants' });

        await user.click(statusChip('To do'));
        const menu = await screen.findByRole('menu');
        expect(within(menu).getByRole('menuitemradio', { name: 'To do' })).toHaveProperty(
            'ariaChecked',
            'true',
        );
        await user.click(within(menu).getByRole('menuitemradio', { name: 'In progress' }));

        expect(await within(column('In progress')).findByText('Water the plants')).toBeTruthy();
        expect(within(column('To do')).queryByText('Water the plants')).toBeNull();
        await waitFor(() => expect(document.activeElement).toBe(statusChip('In progress')));
        expect(
            await within(details).findByText('Moved “Water the plants” to In progress.'),
        ).toBeTruthy();

        const task = (await source.getBoard('2026-09-03')).inProgress[0].task;
        expect(task).toMatchObject({ status: 'inProgress', statusEffectiveDate: '2026-09-03' });
        expect((await source.getBoard('2026-09-02')).todo).toHaveLength(1);
    });

    it('removes a completed task from later boards but keeps it on its date', async () => {
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        await user.click(
            await within(column('To do')).findByRole('button', { name: 'Water the plants' }),
        );
        const details = await screen.findByRole('dialog', { name: 'Water the plants' });

        await user.click(statusChip('To do'));
        await user.click(await screen.findByRole('menuitemradio', { name: 'Completed' }));

        expect(await within(column('Completed')).findByText('Water the plants')).toBeTruthy();
        await user.click(within(details).getByRole('button', { name: 'Close' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        await user.click(screen.getByRole('link', { name: 'Next day' }));
        await waitForBoard();
        expect(screen.queryByText('Water the plants')).toBeNull();
        await user.click(screen.getByRole('link', { name: 'Previous day' }));
        expect(await within(column('Completed')).findByText('Water the plants')).toBeTruthy();
    });

    it('reopens a completed task', async () => {
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        await user.click(
            await within(column('To do')).findByRole('button', { name: 'Water the plants' }),
        );
        const details = await screen.findByRole('dialog', { name: 'Water the plants' });

        await user.click(statusChip('To do'));
        await user.click(await screen.findByRole('menuitemradio', { name: 'Completed' }));
        await within(column('Completed')).findByText('Water the plants');
        await user.click(within(details).getByRole('button', { name: 'Close' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        await user.click(
            await within(column('Completed')).findByRole('button', { name: 'Water the plants' }),
        );
        await screen.findByRole('dialog', { name: 'Water the plants' });
        await user.click(statusChip('Completed'));
        await user.click(await screen.findByRole('menuitemradio', { name: 'To do' }));

        expect(await within(column('To do')).findByText('Water the plants')).toBeTruthy();
        expect((await source.getBoard('2026-09-04')).todo).toHaveLength(1);
    });

    it('rolls back a rejected move, explains it, and returns focus to the card', async () => {
        const { user } = renderTasks(
            '/tasks/2026-09-03',
            createMockTasksApi({ tasks: [anytimeTask()] }),
        );
        await user.click(
            await within(column('To do')).findByRole('button', { name: 'Water the plants' }),
        );
        const details = await screen.findByRole('dialog', { name: 'Water the plants' });
        vi.spyOn(tasksApi, 'moveTask').mockRejectedValue(
            new TaskApiError('VERSION_CONFLICT', 'A newer version of this Task exists.'),
        );

        await user.click(statusChip('To do'));
        await user.click(await screen.findByRole('menuitemradio', { name: 'Completed' }));

        const alert = await within(details).findByRole('alert');
        expect(within(alert).getByText('Task not moved')).toBeTruthy();
        expect(alert.textContent).toContain('changed elsewhere');
        expect(await within(column('To do')).findByText('Water the plants')).toBeTruthy();
        expect(within(column('Completed')).queryByText('Water the plants')).toBeNull();
        await waitFor(() => expect(document.activeElement).toBe(statusChip('To do')));

        await user.click(within(alert).getByRole('button', { name: 'Dismiss' }));
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('moves a task by dragging it to another column with a mouse', async () => {
        const columnX: Record<string, number> = { completed: 600, inProgress: 300, todo: 0 };
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
            this: HTMLElement,
        ) {
            const status = this.closest<HTMLElement>('[data-status]')?.dataset.status;
            const left = status === undefined ? 0 : (columnX[status] ?? 0);
            const isCard = this.dataset.taskId !== undefined;
            const top = isCard ? 60 : 0;
            const width = 300;
            const height = isCard ? 80 : 500;
            return DOMRect.fromRect({ height, width, x: left, y: top });
        });
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        renderTasks('/tasks/2026-09-03', source);
        await within(column('To do')).findByText('Water the plants');

        const card = document.querySelector<HTMLElement>(`[data-task-id="${anytimeTask().id}"]`);
        expect(card).not.toBeNull();
        fireEvent.mouseDown(card ?? document.body, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 250, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 450, clientY: 120 });
        fireEvent.mouseUp(document, { clientX: 450, clientY: 120 });

        expect(await within(column('In progress')).findByText('Water the plants')).toBeTruthy();
        expect((await source.getBoard('2026-09-03')).inProgress).toHaveLength(1);
    });
});
