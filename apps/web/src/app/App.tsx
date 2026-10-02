import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { AppRouter } from './router.tsx';

import '@/styles/index.css';
import '@/shared/i18n/i18n';

import { AppProviders } from './providers/AppProviders.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppProviders>
            <AppRouter />
        </AppProviders>
    </StrictMode>,
);
