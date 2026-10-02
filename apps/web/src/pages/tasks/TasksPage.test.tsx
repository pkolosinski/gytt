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
    type TaskStep,
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
    vi.spyOn(tasksApi, 'toggleStep').mockImplementation(source.toggleStep);
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
        steps: [],
        title: 'Water the plants',
        type: 'anytime',
        version: '1',
        ...overrides,
    };
}

function taskStep(id: string, text: string, isCompleted = false): TaskStep {
    return { id, isCompleted, text };
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

    it('adds card padding, separates Steps, and places the carried date at the bottom', async () => {
        const source = createMockTasksApi({
            tasks: [
                anytimeTask(),
                anytimeTask({
                    details: 'A long description. '.repeat(200),
                    id: '22222222-3333-4444-8555-666666666666',
                    title: 'A long task title '.repeat(12),
                }),
                anytimeTask({
                    id: '33333333-4444-4555-8666-777777777777',
                    steps: [
                        taskStep('aaaaaaaa-0000-4000-8000-000000000001', 'Call the library'),
                        taskStep('aaaaaaaa-0000-4000-8000-000000000002', 'Bring proof of address'),
                    ],
                }),
            ],
        });
        renderTasks('/tasks/2026-09-03', source);
        await waitForBoard();

        const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-task-id]'));
        expect(cards).toHaveLength(3);
        expect(cards.every((card) => card.classList.contains('min-h-28'))).toBe(true);
        expect(cards.every((card) => !card.classList.contains('h-28'))).toBe(true);
        expect(cards[0]?.classList.contains('p-3')).toBe(true);
        expect(
            cards[1]?.querySelector('[data-task-title-text]')?.classList.contains('text-base'),
        ).toBe(true);
        const cardAction = cards[1]?.querySelector<HTMLButtonElement>('[data-task-title]');
        expect(cardAction?.classList.contains('absolute')).toBe(true);
        expect(cardAction?.classList.contains('inset-0')).toBe(true);
        expect(cards[1]?.querySelector('p')?.classList.contains('text-sm')).toBe(true);
        expect(cards[2]?.classList.contains('gap-2')).toBe(true);
        expect(cards[2]?.querySelector(':scope > div')?.classList.contains('gap-2')).toBe(true);
        expect(within(cards[2]!).getAllByRole('checkbox')).toHaveLength(2);
        const stepsHeading = within(cards[2]!).getByText('Steps');
        const stepList = within(cards[2]!).getByRole('list', { name: 'Steps' });
        const since = within(cards[2]!).getByText(/^Since /);
        expect(stepList.parentElement?.classList.contains('border-t')).toBe(true);
        expect(stepList.parentElement?.classList.contains('pt-3')).toBe(true);
        expect(stepList.parentElement?.classList.contains('gap-2')).toBe(true);
        expect(
            stepsHeading.compareDocumentPosition(since) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
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
        expect(card.closest('[data-task-id]')?.textContent).toContain(markup);
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
        expect(within(dialog).getByLabelText(/^Title/)).toHaveProperty('required', true);
        expect(within(dialog).getByText('*')).toBeTruthy();
        expect(within(dialog).getByLabelText('Description')).toBeTruthy();
        expect(within(dialog).queryByText('(optional)')).toBeNull();
        expect(within(dialog).queryByLabelText('Start date')).toBeNull();
        expect(within(dialog).queryByLabelText('Status')).toBeNull();

        await user.type(within(dialog).getByLabelText(/^Title/), 'Call the plumber');
        await user.type(within(dialog).getByLabelText('Description'), 'Call after 5 p.m.');
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

    it('creates, edits, and removes Step text without losing the checklist state', async () => {
        const { source, user } = renderTasks('/tasks/2026-09-03');
        await waitForBoard();

        await user.click(screen.getByRole('button', { name: 'New task' }));
        const createDialog = await screen.findByRole('dialog', { name: 'Create new task' });
        await user.type(within(createDialog).getByLabelText(/^Title/), 'Prepare the garden');
        const addStepButton = within(createDialog).getByRole('button', { name: 'Add a step' });
        expect(addStepButton.textContent).toBe('');
        expect(addStepButton.querySelector('svg')).not.toBeNull();
        await user.click(addStepButton);
        const firstStepInput = within(createDialog).getByLabelText('Step 1');
        const removeFirstStepButton = within(createDialog).getByRole('button', {
            name: 'Remove step 1',
        });
        expect(
            removeFirstStepButton.compareDocumentPosition(firstStepInput) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(removeFirstStepButton.querySelector('svg')).not.toBeNull();
        await user.type(within(createDialog).getByLabelText('Step 1'), 'Buy soil');
        await user.click(within(createDialog).getByRole('button', { name: 'Add a step' }));
        await user.type(within(createDialog).getByLabelText('Step 2'), 'Water the plants');
        await user.click(within(createDialog).getByRole('button', { name: 'Remove step 2' }));
        await user.click(within(createDialog).getByRole('button', { name: 'Create task' }));

        const card = await within(column('To do')).findByRole('button', {
            name: 'Prepare the garden',
        });
        let task = (await source.getBoard('2026-09-03')).todo[0]?.task;
        expect(task?.steps.map((step) => step.text)).toEqual(['Buy soil']);
        const stepId = task?.steps[0]?.id;

        await user.click(card);
        const details = await screen.findByRole('dialog', { name: 'Prepare the garden' });
        await user.click(within(details).getByRole('button', { name: 'Edit' }));
        const stepInput = within(details).getByLabelText('Step 1');
        await user.clear(stepInput);
        await user.type(stepInput, 'Buy compost');
        await user.click(within(details).getByRole('button', { name: 'Add a step' }));
        await user.type(within(details).getByLabelText('Step 2'), 'Plant seedlings');
        await user.click(within(details).getByRole('button', { name: 'Save changes' }));

        task = (await source.getBoard('2026-09-03')).todo[0]?.task;
        expect(task?.steps).toMatchObject([
            { id: stepId, isCompleted: false, text: 'Buy compost' },
            { isCompleted: false, text: 'Plant seedlings' },
        ]);
    });

    it('validates Step text by Unicode code points', async () => {
        const { source, user } = renderTasks('/tasks/2026-09-03');
        await waitForBoard();

        await user.click(screen.getByRole('button', { name: 'New task' }));
        const dialog = await screen.findByRole('dialog', { name: 'Create new task' });
        await user.type(within(dialog).getByLabelText(/^Title/), 'Read a long Step');
        await user.click(within(dialog).getByRole('button', { name: 'Add a step' }));
        fireEvent.change(within(dialog).getByLabelText('Step 1'), {
            target: { value: '😀'.repeat(201) },
        });
        await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

        const stepInput = within(dialog).getByLabelText('Step 1');
        expect(stepInput.getAttribute('aria-invalid')).toBe('true');
        expect(within(dialog).getByText('Use at most 200 characters.')).toBeTruthy();
        expect((await source.getBoard('2026-09-03')).todo).toHaveLength(0);
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

        await user.type(within(dialog).getByLabelText(/^Title/), 'Sort the mail');
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

    it('checks Steps when a Task is created directly in Completed', async () => {
        const { source, user } = renderTasks('/tasks/2026-09-03');
        await waitForBoard();

        await user.click(screen.getByRole('button', { name: 'Create task in Completed' }));
        const dialog = await screen.findByRole('dialog', { name: 'Create new task' });
        await user.type(within(dialog).getByLabelText(/^Title/), 'Finish the report');
        await user.click(within(dialog).getByRole('button', { name: 'Add a step' }));
        await user.type(within(dialog).getByLabelText('Step 1'), 'Review the final draft');
        await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

        const checkbox = await within(column('Completed')).findByRole('checkbox', {
            name: 'Complete step: Review the final draft',
        });
        expect(checkbox).toHaveProperty('checked', true);
        expect(checkbox).toHaveProperty('disabled', true);
        expect((await source.getBoard('2026-09-03')).completed[0]?.task.steps).toMatchObject([
            { isCompleted: true, text: 'Review the final draft' },
        ]);
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
        await user.type(within(dialog).getByLabelText(/^Title/), '   ');
        await user.type(within(dialog).getByLabelText(/Description/), 'Keep this draft');
        await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

        const title = within(dialog).getByLabelText(/^Title/);
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

        const title = within(dialog).getByLabelText(/^Title/);
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
        await user.type(within(dialog).getByLabelText(/^Title/), ' today');

        await source.updateTask(
            anytimeTask().id,
            {
                details: null,
                id: anytimeTask().id,
                startDate: '2026-09-10',
                steps: [],
                title: 'Water the garden',
                type: 'anytime',
            },
            '1',
            '2026-09-03',
        );
        await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

        expect(await within(dialog).findByText('This task changed elsewhere')).toBeTruthy();
        expect(within(dialog).getByLabelText(/^Title/)).toHaveProperty('value', 'Water the garden');
        expect(within(dialog).queryByLabelText('Start date')).toBeNull();
        await waitFor(() => expect(within(column('To do')).queryByText(/Water the/)).toBeNull());
        expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeTruthy();
        expect((await source.getTask(anytimeTask().id)).title).toBe('Water the garden');
    });
});

describe('Task Steps', () => {
    it('keeps an identical create retry idempotent after a Step changes', async () => {
        const step = taskStep('aaaaaaaa-0000-4000-8000-000000000010', 'Prepare the materials');
        const input = {
            details: null,
            id: '55555555-6666-4777-8888-999999999999',
            startDate: '2026-09-03',
            steps: [step],
            title: 'Prepare for the meeting',
            type: 'anytime' as const,
        };
        const source = createMockTasksApi();
        const created = await source.createTask(input, 'todo');
        const checked = await source.toggleStep(input.id, step.id, {
            effectiveDate: '2026-09-03',
            isCompleted: true,
            version: created.version,
        });

        await expect(source.createTask(input, 'todo')).resolves.toMatchObject({
            status: 'inProgress',
            steps: [{ isCompleted: true, text: step.text }],
            version: checked.version,
        });
    });

    it('checks a Step on a To do Task, moves it to In progress, and shares state across dates', async () => {
        const task = anytimeTask({
            steps: [
                taskStep('aaaaaaaa-0000-4000-8000-000000000011', 'Gather the documents'),
                taskStep('aaaaaaaa-0000-4000-8000-000000000012', 'Submit the form'),
            ],
        });
        const source = createMockTasksApi({ tasks: [task] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        await waitForBoard();

        await user.click(
            within(column('To do')).getByRole('checkbox', {
                name: 'Complete step: Gather the documents',
            }),
        );

        const updatedCheckbox = await within(column('In progress')).findByRole('checkbox', {
            name: 'Complete step: Gather the documents',
        });
        expect(updatedCheckbox).toHaveProperty('checked', true);
        expect(screen.queryByRole('alertdialog')).toBeNull();
        expect((await source.getBoard('2026-09-03')).inProgress[0]?.task).toMatchObject({
            status: 'inProgress',
            statusEffectiveDate: '2026-09-03',
            steps: [
                { isCompleted: true, text: 'Gather the documents' },
                { isCompleted: false, text: 'Submit the form' },
            ],
        });
        expect((await source.getBoard('2026-09-02')).todo[0]?.task.steps[0]?.isCompleted).toBe(
            true,
        );
    });

    it('restores Step focus when checking it does not change Task status', async () => {
        const task = anytimeTask({
            latestStatus: 'inProgress',
            latestStatusEffectiveDate: '2026-09-02',
            steps: [taskStep('aaaaaaaa-0000-4000-8000-000000000013', 'Review the notes')],
        });
        const source = createMockTasksApi({ tasks: [task] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        const checkbox = await within(column('In progress')).findByRole('checkbox', {
            name: 'Complete step: Review the notes',
        });

        await user.click(checkbox);

        const updatedCheckbox = await within(column('In progress')).findByRole('checkbox', {
            name: 'Complete step: Review the notes',
        });
        expect(updatedCheckbox).toHaveProperty('checked', true);
        await waitFor(() => expect(document.activeElement).toBe(updatedCheckbox));
        expect((await source.getBoard('2026-09-03')).inProgress[0]?.task.status).toBe('inProgress');
    });

    it('lets keyboard users check Steps', async () => {
        const task = anytimeTask({
            steps: [
                taskStep('aaaaaaaa-0000-4000-8000-000000000015', 'Collect receipts'),
                taskStep('aaaaaaaa-0000-4000-8000-000000000016', 'File the report'),
            ],
        });
        const source = createMockTasksApi({ tasks: [task] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        const checkbox = await within(column('To do')).findByRole('checkbox', {
            name: 'Complete step: Collect receipts',
        });

        checkbox.focus();
        await user.keyboard(' ');

        expect(
            await within(column('In progress')).findByRole('checkbox', {
                name: 'Complete step: Collect receipts',
            }),
        ).toHaveProperty('checked', true);
        expect((await source.getBoard('2026-09-03')).inProgress).toHaveLength(1);
    });

    it('keeps the final Step checked when its completion prompt is declined', async () => {
        const task = anytimeTask({
            steps: [taskStep('aaaaaaaa-0000-4000-8000-000000000021', 'Send the invoice')],
        });
        const source = createMockTasksApi({ tasks: [task] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        await waitForBoard();

        await user.click(
            within(column('To do')).getByRole('checkbox', {
                name: 'Complete step: Send the invoice',
            }),
        );

        const confirmation = await screen.findByRole('alertdialog', {
            name: 'Move task Water the plants to Completed',
        });
        expect(within(confirmation).getByRole('button', { name: 'Yes' })).toBeTruthy();
        expect(within(confirmation).getAllByRole('button')).toHaveLength(2);
        expect(within(confirmation).queryByText(/Any incomplete Steps/)).toBeNull();
        await user.click(within(confirmation).getByRole('button', { name: 'No' }));

        const stepCheckbox = await within(column('In progress')).findByRole('checkbox', {
            name: 'Complete step: Send the invoice',
        });
        expect(stepCheckbox).toHaveProperty('checked', true);
        expect(within(column('Completed')).queryByText(task.title)).toBeNull();
        expect((await source.getBoard('2026-09-03')).inProgress[0]?.task.status).toBe('inProgress');
        await waitFor(() =>
            expect(within(column('In progress')).getByRole('button', { name: task.title })).toBe(
                document.activeElement,
            ),
        );
    });

    it('moves the Task to Completed when the final Step prompt is confirmed', async () => {
        const task = anytimeTask({
            latestStatus: 'inProgress',
            latestStatusEffectiveDate: '2026-09-02',
            steps: [
                taskStep('aaaaaaaa-0000-4000-8000-000000000031', 'Review the draft'),
                taskStep('aaaaaaaa-0000-4000-8000-000000000032', 'Send the report'),
            ],
        });
        const source = createMockTasksApi({ tasks: [task] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        await waitForBoard();

        await user.click(
            within(column('In progress')).getByRole('checkbox', {
                name: 'Complete step: Review the draft',
            }),
        );
        expect(
            await within(column('In progress')).findByRole('checkbox', {
                name: 'Complete step: Send the report',
            }),
        ).toBeTruthy();
        await user.click(
            within(column('In progress')).getByRole('checkbox', {
                name: 'Complete step: Send the report',
            }),
        );

        const confirmation = await screen.findByRole('alertdialog', {
            name: 'Move task Water the plants to Completed',
        });
        await user.click(within(confirmation).getByRole('button', { name: 'Yes' }));

        const completedStep = await within(column('Completed')).findByRole('checkbox', {
            name: 'Complete step: Send the report',
        });
        expect(completedStep).toHaveProperty('checked', true);
        expect(completedStep).toHaveProperty('disabled', true);
        expect((await source.getBoard('2026-09-03')).completed[0]?.task.steps).toEqual([
            {
                id: 'aaaaaaaa-0000-4000-8000-000000000031',
                text: 'Review the draft',
                isCompleted: true,
            },
            {
                id: 'aaaaaaaa-0000-4000-8000-000000000032',
                text: 'Send the report',
                isCompleted: true,
            },
        ]);
    });

    it('prompts when the final Step is checked from Task details', async () => {
        const task = anytimeTask({
            latestStatus: 'inProgress',
            latestStatusEffectiveDate: '2026-09-02',
            steps: [taskStep('aaaaaaaa-0000-4000-8000-000000000033', 'Send the invoice')],
        });
        const { user } = renderTasks('/tasks/2026-09-03', createMockTasksApi({ tasks: [task] }));
        await user.click(
            await within(column('In progress')).findByRole('button', { name: task.title }),
        );
        const details = await screen.findByRole('dialog', { name: task.title });

        await user.click(
            within(details).getByRole('checkbox', { name: 'Complete step: Send the invoice' }),
        );

        const confirmation = await screen.findByRole('alertdialog', {
            name: 'Move task Water the plants to Completed',
        });
        await user.click(within(confirmation).getByRole('button', { name: 'No' }));

        expect(
            await within(details).findByRole('checkbox', {
                name: 'Complete step: Send the invoice',
            }),
        ).toHaveProperty('checked', true);
        expect(
            within(details).getByRole('button', {
                name: 'In progress: move “Water the plants”',
            }),
        ).toBeTruthy();
    });

    it('checks open Steps when the Task is moved to Completed and preserves them when reopened', async () => {
        const task = anytimeTask({
            steps: [
                taskStep('aaaaaaaa-0000-4000-8000-000000000035', 'Proofread the document'),
                taskStep('aaaaaaaa-0000-4000-8000-000000000036', 'Send it to the team'),
            ],
        });
        const source = createMockTasksApi({ tasks: [task] });
        const { user } = renderTasks('/tasks/2026-09-03', source);
        await user.click(await within(column('To do')).findByRole('button', { name: task.title }));
        const details = await screen.findByRole('dialog', { name: task.title });

        await user.click(
            within(details).getByRole('button', {
                name: `To do: move “${task.title}”`,
            }),
        );
        await user.click(await screen.findByRole('menuitemradio', { name: 'Completed' }));
        expect(screen.queryByRole('alertdialog')).toBeNull();

        const completedCheckbox = await within(details).findByRole('checkbox', {
            name: 'Complete step: Proofread the document',
        });
        expect(completedCheckbox).toHaveProperty('checked', true);
        expect(completedCheckbox).toHaveProperty('disabled', true);
        expect((await source.getTask(task.id)).steps.every((step) => step.isCompleted)).toBe(true);

        await user.click(
            within(details).getByRole('button', {
                name: `Completed: move “${task.title}”`,
            }),
        );
        await user.click(await screen.findByRole('menuitemradio', { name: 'To do' }));

        const reopenedCheckbox = await within(details).findByRole('checkbox', {
            name: 'Complete step: Proofread the document',
        });
        expect(reopenedCheckbox).toHaveProperty('checked', true);
        expect(reopenedCheckbox).toHaveProperty('disabled', false);
        await user.click(reopenedCheckbox);
        expect((await source.getTask(task.id)).steps[0]?.isCompleted).toBe(false);
    });

    it('shares Steps across dates while locking editing by the displayed Task status', async () => {
        const task = anytimeTask({
            latestStatus: 'completed',
            latestStatusEffectiveDate: '2026-09-03',
            steps: [
                taskStep('aaaaaaaa-0000-4000-8000-000000000041', 'Return the library books', true),
            ],
        });
        const source = createMockTasksApi({ tasks: [task] });
        const { user } = renderTasks('/tasks/2026-09-02', source);
        await waitForBoard();

        const historicalCheckbox = within(column('To do')).getByRole('checkbox', {
            name: 'Complete step: Return the library books',
        });
        expect(historicalCheckbox).toHaveProperty('checked', true);
        expect(historicalCheckbox).toHaveProperty('disabled', false);
        await user.click(historicalCheckbox);
        expect(
            await within(column('To do')).findByRole('checkbox', {
                name: 'Complete step: Return the library books',
            }),
        ).toHaveProperty('checked', false);

        await user.click(screen.getByRole('link', { name: 'Next day' }));
        const completedCheckbox = await within(column('Completed')).findByRole('checkbox', {
            name: 'Complete step: Return the library books',
        });
        expect(completedCheckbox).toHaveProperty('checked', false);
        expect(completedCheckbox).toHaveProperty('disabled', true);

        await user.click(within(column('Completed')).getByRole('button', { name: task.title }));
        const details = await screen.findByRole('dialog', { name: task.title });
        await user.click(within(details).getByRole('button', { name: 'Edit' }));
        expect(within(details).getByLabelText('Step 1').matches(':disabled')).toBe(true);
        expect(
            within(details).getByRole('button', { name: 'Add a step' }).matches(':disabled'),
        ).toBe(true);

        expect((await source.getBoard('2026-09-03')).completed[0]?.task.steps[0]?.isCompleted).toBe(
            false,
        );

        const saved = await source.getTask(task.id);
        const renamedSteps = saved.steps.map((step) => ({ ...step, text: `${step.text} again` }));
        await expect(
            source.updateTask(
                task.id,
                {
                    details: saved.details,
                    id: saved.id,
                    startDate: saved.startDate,
                    steps: renamedSteps,
                    title: saved.title,
                    type: saved.type,
                },
                saved.version,
                '2026-09-03',
            ),
        ).rejects.toMatchObject({ code: 'INVALID_CALENDAR_OPERATION' });
        await expect(
            source.toggleStep(task.id, saved.steps[0]!.id, {
                effectiveDate: '2026-09-03',
                isCompleted: true,
                version: saved.version,
            }),
        ).rejects.toMatchObject({ code: 'INVALID_CALENDAR_OPERATION' });
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
                    steps: task.steps,
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
        expect(screen.queryByRole('alertdialog')).toBeNull();
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
        expect(screen.queryByRole('alertdialog')).toBeNull();
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
        const title = card?.querySelector<HTMLElement>('button');
        fireEvent.mouseDown(title ?? document.body, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 250, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 450, clientY: 120 });
        fireEvent.mouseUp(document, { clientX: 450, clientY: 120 });

        expect(await within(column('In progress')).findByText('Water the plants')).toBeTruthy();
        expect((await source.getBoard('2026-09-03')).inProgress).toHaveLength(1);
    });

    it('moves a board drag to Completed without a prompt and checks every Step', async () => {
        const columnX: Record<string, number> = { completed: 600, inProgress: 300, todo: 0 };
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
            this: HTMLElement,
        ) {
            const status = this.closest<HTMLElement>('[data-status]')?.dataset.status;
            const left = status === undefined ? 0 : (columnX[status] ?? 0);
            const isCard = this.dataset.taskId !== undefined;
            return DOMRect.fromRect({
                height: isCard ? 120 : 500,
                width: 300,
                x: left,
                y: isCard ? 60 : 0,
            });
        });
        const task = anytimeTask({
            steps: [taskStep('aaaaaaaa-0000-4000-8000-000000000061', 'Send the invoice')],
        });
        const source = createMockTasksApi({ tasks: [task] });
        renderTasks('/tasks/2026-09-03', source);
        await within(column('To do')).findByText(task.title);

        const card = document.querySelector<HTMLElement>(`[data-task-id="${task.id}"]`);
        const title = card?.querySelector<HTMLElement>('button');
        fireEvent.mouseDown(title ?? document.body, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 250, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 750, clientY: 120 });
        fireEvent.mouseUp(document, { clientX: 750, clientY: 120 });

        await waitFor(() =>
            expect(tasksApi.moveTask).toHaveBeenCalledWith(task.id, {
                effectiveDate: '2026-09-03',
                status: 'completed',
                version: task.version,
            }),
        );
        expect(screen.queryByRole('alertdialog')).toBeNull();

        const completedStep = await within(column('Completed')).findByRole('checkbox', {
            name: 'Complete step: Send the invoice',
        });
        expect(completedStep).toHaveProperty('checked', true);
        expect(completedStep).toHaveProperty('disabled', true);
        expect((await source.getBoard('2026-09-03')).completed[0]?.task.id).toBe(task.id);
    });

    it('does not start a drag from a Step checkbox', async () => {
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
            this: HTMLElement,
        ) {
            const status = this.closest<HTMLElement>('[data-status]')?.dataset.status;
            const left = status === 'completed' ? 600 : status === 'inProgress' ? 300 : 0;
            const isCard = this.dataset.taskId !== undefined;
            return DOMRect.fromRect({
                height: isCard ? 120 : 500,
                width: 300,
                x: left,
                y: isCard ? 60 : 0,
            });
        });
        const task = anytimeTask({
            latestStatus: 'inProgress',
            latestStatusEffectiveDate: '2026-09-02',
            steps: [taskStep('aaaaaaaa-0000-4000-8000-000000000051', 'Read the instructions')],
        });
        const source = createMockTasksApi({ tasks: [task] });
        renderTasks('/tasks/2026-09-03', source);

        const checkbox = await within(column('In progress')).findByRole('checkbox', {
            name: 'Complete step: Read the instructions',
        });
        fireEvent.mouseDown(checkbox, { button: 0, clientX: 350, clientY: 100 });
        fireEvent.mouseMove(document, { clientX: 650, clientY: 120 });
        fireEvent.mouseUp(document, { clientX: 650, clientY: 120 });

        expect(await within(column('In progress')).findByText(task.title)).toBeTruthy();
        expect(within(column('Completed')).queryByText(task.title)).toBeNull();
        expect((await source.getBoard('2026-09-03')).inProgress).toHaveLength(1);
        expect((await source.getTask(task.id)).steps[0]?.isCompleted).toBe(false);
    });
});
