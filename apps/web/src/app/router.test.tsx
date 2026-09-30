// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AppRouter } from './router.tsx';

function renderRoute(path: string) {
    return render(
        <QueryClientProvider client={new QueryClient()}>
            <MemoryRouter initialEntries={[path]}>
                <AppRouter />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

afterEach(cleanup);

describe('application routes', () => {
    it('renders the Dashboard greeting and local module links', () => {
        const { container } = renderRoute('/');

        expect(screen.getByRole('heading', { name: 'Make today count.' })).toBeTruthy();
        expect(container.querySelector('a[href="/tasks"]')).not.toBeNull();
        expect(container.querySelector('a[href="/habits/day"]')).not.toBeNull();
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
