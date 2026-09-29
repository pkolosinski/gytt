// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { createMockTasksDataSource, TasksDataSourceProvider } from '@/features/tasks/index.ts';
import { LocaleProvider } from '@/shared/i18n/LocaleProvider.tsx';
import type { Language } from '@/shared/i18n/translations.ts';
import { formatLocalDateLong } from '@/shared/lib/local-date.ts';

import { AppRouter } from './router.tsx';

function renderRoute(path: string, language: Language | null = 'en') {
    return render(
        <LocaleProvider initialLanguage={language ?? undefined}>
            <QueryClientProvider client={new QueryClient()}>
                <TasksDataSourceProvider source={createMockTasksDataSource()}>
                    <MemoryRouter initialEntries={[path]}>
                        <AppRouter />
                    </MemoryRouter>
                </TasksDataSourceProvider>
            </QueryClientProvider>
        </LocaleProvider>,
    );
}

afterEach(() => {
    cleanup();
    window.localStorage.clear();
    document.documentElement.lang = 'pl';
});

describe('application routes', () => {
    it('renders the Dashboard greeting and local module links', () => {
        const { container } = renderRoute('/');

        expect(screen.getByRole('heading', { name: 'Make today count.' })).toBeTruthy();
        expect(container.querySelector('a[href="/tasks"]')).not.toBeNull();
        expect(container.querySelector('a[href="/habits/day"]')).not.toBeNull();
    });

    it('defaults to Polish when no language preference exists', async () => {
        window.localStorage.clear();
        renderRoute('/', null);

        expect(screen.getByRole('heading', { name: 'Niech ten dzień będzie dobry.' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Zadania' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Nawyki' })).toBeTruthy();
        expect(screen.getByRole('combobox', { name: 'Język' })).toHaveProperty('value', 'pl');
        await waitFor(() => expect(document.documentElement.lang).toBe('pl'));
    });

    it('falls back to Polish for an unsupported saved language', () => {
        window.localStorage.setItem('gytt.language', 'fr');
        renderRoute('/', null);

        expect(screen.getByRole('heading', { name: 'Niech ten dzień będzie dobry.' })).toBeTruthy();
        expect(screen.getByRole('combobox', { name: 'Język' })).toHaveProperty('value', 'pl');
    });

    it('switches language and restores the saved choice on another route', async () => {
        const user = userEvent.setup();
        renderRoute('/', 'pl');

        await user.selectOptions(screen.getByRole('combobox', { name: 'Język' }), 'en');

        expect(screen.getByRole('heading', { name: 'Make today count.' })).toBeTruthy();
        await waitFor(() => expect(document.documentElement.lang).toBe('en'));
        expect(window.localStorage.getItem('gytt.language')).toBe('en');

        cleanup();
        renderRoute('/habits/day', null);
        expect(screen.getByText('Workspace coming next')).toBeTruthy();
        expect(screen.getByRole('combobox', { name: 'Language' })).toHaveProperty('value', 'en');
    });

    it('localizes the Tasks view and date formatting', async () => {
        const user = userEvent.setup();
        renderRoute('/tasks/2026-09-03', 'pl');

        expect(await screen.findByRole('heading', { name: 'Zadania' })).toBeTruthy();
        expect(screen.getByRole('region', { name: 'Tablica zadań' })).toBeTruthy();
        expect(screen.getByText(formatLocalDateLong('2026-09-03', 'pl-PL'))).toBeTruthy();

        await user.selectOptions(screen.getByRole('combobox', { name: 'Język' }), 'en');

        expect(await screen.findByRole('heading', { name: 'Tasks' })).toBeTruthy();
        expect(screen.getByRole('region', { name: 'Task board' })).toBeTruthy();
        expect(screen.getByText(formatLocalDateLong('2026-09-03', 'en-US'))).toBeTruthy();
    });

    it.each(['/habits/day', '/habits/week', '/habits/month'])(
        'resolves the local %s route',
        (path) => {
            renderRoute(path);

            expect(screen.getByText('Workspace coming next')).toBeTruthy();
        },
    );

    it('resolves the Tasks date route', async () => {
        renderRoute('/tasks/2026-09-03');

        expect(await screen.findByRole('heading', { level: 1, name: 'Tasks' })).toBeTruthy();
    });
});
