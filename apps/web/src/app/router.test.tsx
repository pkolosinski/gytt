import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AppRouter } from './router.tsx';

function renderRoute(path: string) {
    return renderToStaticMarkup(
        <MemoryRouter initialEntries={[path]}>
            <AppRouter />
        </MemoryRouter>,
    );
}

describe('application routes', () => {
    it('renders the Dashboard greeting and local module links', () => {
        const markup = renderRoute('/');

        expect(markup).toContain('Make today count.');
        expect(markup).toContain('href="/tasks"');
        expect(markup).toContain('href="/habits/day"');
    });

    it.each(['/tasks', '/habits/day', '/habits/week', '/habits/month'])(
        'resolves the local %s route',
        (path) => {
            expect(renderRoute(path)).toContain('Workspace coming next');
        },
    );
});
