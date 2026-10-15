import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';

import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/shared/theme/theme.tsx';
import { queryClient } from './query-client.ts';

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
