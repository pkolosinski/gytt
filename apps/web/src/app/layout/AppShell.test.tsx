// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next from 'i18next';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AppRouter } from '../router.tsx';

function renderShell(path: string) {
    render(
        <QueryClientProvider client={new QueryClient()}>
            <MemoryRouter initialEntries={[path]}>
                <AppRouter />
            </MemoryRouter>
        </QueryClientProvider>,
    );
    return userEvent.setup();
}

afterEach(async () => {
    cleanup();
    await i18next.changeLanguage('en');
    document.documentElement.classList.remove('dark');
});

describe('application shell', () => {
    it('links to every section and marks the current one', () => {
        renderShell('/habits/week');

        const sections = within(screen.getByRole('navigation', { name: 'Menu' }));

        expect(sections.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/');
        expect(sections.getByRole('link', { name: 'Tasks' }).getAttribute('href')).toBe('/tasks');
        expect(
            sections.getByRole('link', { current: 'page', name: 'Habits' }).getAttribute('href'),
        ).toBe('/habits/day');
    });

    it('renders the sidebar logo link around the routed page', () => {
        renderShell('/');

        expect(screen.getByRole('link', { name: 'GYTT home' }).getAttribute('href')).toBe('/');
        expect(screen.getByRole('button', { name: 'Open menu' })).toBeTruthy();
        expect(
            within(screen.getByRole('main')).getByRole('heading', { name: 'Make today count.' }),
        ).toBeTruthy();
    });

    it('collapses from its edge control and temporarily expands on hover', async () => {
        const user = renderShell('/tasks');
        const sidebar = document.querySelector('[data-slot="sidebar"]');
        const sidebarContainer = document.querySelector('[data-slot="sidebar-container"]');
        if (!(sidebar instanceof HTMLElement)) throw new Error('Sidebar not rendered');
        if (!(sidebarContainer instanceof HTMLElement)) {
            throw new Error('Sidebar container not rendered');
        }

        expect(sidebar.getAttribute('data-state')).toBe('expanded');

        await user.click(within(sidebar).getByRole('button', { name: 'Collapse sidebar' }));

        expect(sidebar.getAttribute('data-state')).toBe('collapsed');
        expect(within(sidebar).getByRole('button', { name: 'Expand sidebar' })).toBeTruthy();

        await user.hover(sidebarContainer);

        expect(sidebar.getAttribute('data-state')).toBe('expanded');

        await user.unhover(sidebarContainer);

        expect(sidebar.getAttribute('data-state')).toBe('collapsed');
    });

    it('toggles between light and dark themes from preferences', async () => {
        const user = renderShell('/');
        const darkTheme = screen.getByRole('switch', { name: 'Dark theme' });

        expect(darkTheme.getAttribute('aria-checked')).toBe('false');

        await user.click(darkTheme);

        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(darkTheme.getAttribute('aria-checked')).toBe('true');

        await user.click(darkTheme);

        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(darkTheme.getAttribute('aria-checked')).toBe('false');
    });

    it('switches the interface language from preferences', async () => {
        const user = renderShell('/');

        await user.click(screen.getByRole('combobox', { name: 'Language' }));
        await user.click(await screen.findByRole('option', { name: 'Polski' }));

        await waitFor(() =>
            expect(screen.getByRole('navigation', { name: 'Menu' }).textContent).toContain(
                'Zadania',
            ),
        );
        expect(document.documentElement.lang).toBe('pl');
        expect(screen.getByRole('combobox', { name: 'Język' }).textContent).toContain('Polski');
        expect(
            screen.getByRole('heading', { name: 'Niech dzisiejszy dzień się liczy.' }),
        ).toBeTruthy();
        expect(i18next.hasResourceBundle('pl', 'translation')).toBe(true);
    });
});
