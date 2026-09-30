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

            expect(screen.getByRole('heading', { name: 'Date not found' })).toBeTruthy();
            expect(currentPath()).toBe(path);
            expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/');
            expect(screen.getByRole('link', { name: 'Today’s tasks' }).getAttribute('href')).toBe(
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
        }
        expect(screen.getByRole('button', { name: 'New task' })).toBeTruthy();
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
            name: new RegExp(markup.slice(0, 8)),
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
        const dialog = await screen.findByRole('dialog', { name: 'New task' });
        expect(within(dialog).getByLabelText('Start date')).toHaveProperty('value', '2026-09-02');

        await user.type(within(dialog).getByLabelText('Title'), 'Call the plumber');
        await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

        expect(await screen.findByRole('dialog', { name: 'Call the plumber' })).toBeTruthy();
        expect(await within(column('To do')).findByText('Call the plumber')).toBeTruthy();
        const board = await source.getBoard('2026-09-02');
        expect(board.todo).toHaveLength(1);
        expect(board.todo[0].task).toMatchObject({
            details: null,
            startDate: '2026-09-02',
            status: 'todo',
            type: 'anytime',
        });
        expect(board.todo[0].task.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
    });

    it('creates an Anytime task with a future start', async () => {
        vi.setSystemTime(new Date(2026, 8, 2, 9, 0, 0));
        const { source, user } = renderTasks('/tasks/2026-09-02');
        await waitForBoard();

        await user.click(screen.getByRole('button', { name: 'New task' }));
        const dialog = await screen.findByRole('dialog', { name: 'New task' });
        await user.type(within(dialog).getByLabelText('Title'), 'Pick up parcel');
        setDate(within(dialog).getByLabelText('Start date'), '2026-09-05');
        await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

        const details = await screen.findByRole('dialog', { name: 'Pick up parcel' });
        expect(within(details).getByText('Not on this board')).toBeTruthy();
        await user.click(within(details).getByRole('button', { name: 'Close' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(within(column('To do')).queryByText('Pick up parcel')).toBeNull();

        expect((await source.getBoard('2026-09-04')).todo).toHaveLength(0);
        setDate(screen.getByLabelText('Go to date'), '2026-09-05');
        expect(await within(column('To do')).findByText('Pick up parcel')).toBeTruthy();
    });

    it('keeps the draft and associates messages with fields when validation fails', async () => {
        const { source, user } = renderTasks('/tasks/2026-09-03');
        await waitForBoard();

        await user.click(screen.getByRole('button', { name: 'New task' }));
        const dialog = await screen.findByRole('dialog', { name: 'New task' });
        await user.type(within(dialog).getByLabelText('Title'), '   ');
        await user.type(within(dialog).getByLabelText(/Details/), 'Keep this draft');
        await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

        const title = within(dialog).getByLabelText('Title');
        expect(title.getAttribute('aria-invalid')).toBe('true');
        const errorId = title.getAttribute('aria-describedby');
        expect(errorId).not.toBeNull();
        expect(document.getElementById(errorId ?? '')?.textContent).toBe('Enter a title.');
        expect(document.activeElement).toBe(title);
        expect(within(dialog).getByLabelText(/Details/)).toHaveProperty('value', 'Keep this draft');
        expect((await source.getBoard('2026-09-03')).todo).toHaveLength(0);
    });

    it('edits an Anytime task without creating a duplicate', async () => {
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        const { user } = renderTasks('/tasks/2026-09-03', source);

        await user.click(await within(column('To do')).findByRole('button', { name: /Water/ }));
        const dialog = await screen.findByRole('dialog', { name: 'Water the plants' });
        await user.click(within(dialog).getByRole('button', { name: 'Edit' }));

        const title = within(dialog).getByLabelText('Title');
        await user.clear(title);
        await user.type(title, 'Water the balcony plants');
        await user.type(within(dialog).getByLabelText(/Details/), 'Use the rain barrel.');
        setDate(within(dialog).getByLabelText('Start date'), '2026-09-01');
        await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

        expect(
            await screen.findByRole('dialog', { name: 'Water the balcony plants' }),
        ).toBeTruthy();
        expect(await within(column('To do')).findByText('Water the balcony plants')).toBeTruthy();
        expect(within(column('To do')).getAllByRole('listitem', { hidden: true })).toHaveLength(1);
        expect(await source.getTask(anytimeTask().id)).toMatchObject({
            details: 'Use the rain barrel.',
            startDate: '2026-09-01',
            title: 'Water the balcony plants',
            version: '2',
        });
    });

    it('reloads a Task by ID after a version conflict and drops it from the board', async () => {
        const source = createMockTasksApi({ tasks: [anytimeTask()] });
        const { user } = renderTasks('/tasks/2026-09-03', source);

        await user.click(await within(column('To do')).findByRole('button', { name: /Water/ }));
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
        expect(within(dialog).getByLabelText('Start date')).toHaveProperty('value', '2026-09-10');
        await waitFor(() => expect(within(column('To do')).queryByText(/Water the/)).toBeNull());
        expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeTruthy();
        expect((await source.getTask(anytimeTask().id)).title).toBe('Water the garden');
    });
});
