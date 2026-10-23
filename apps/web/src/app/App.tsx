import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/styles/index.css';
import '@/shared/i18n/i18n';

import { AppProviders } from './AppProviders.tsx';
import { AppRouter } from './AppRouter.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
