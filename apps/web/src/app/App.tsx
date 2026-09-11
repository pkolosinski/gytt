import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { AppRouter } from './router.tsx';

import '../styles/index.css';

import { initI18n } from '../shared/i18n/i18n.ts';
import { detectBrowserLanguage } from '../shared/i18n/languages.ts';
import { applyTheme, systemTheme } from '../shared/theme/theme.ts';
import { AppProviders } from './providers/AppProviders.tsx';

applyTheme(systemTheme());

// Render only once the active dictionary is loaded, so no untranslated text flashes.
void initI18n(detectBrowserLanguage()).then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <AppProviders>
                <AppRouter />
            </AppProviders>
        </StrictMode>,
    );
});
