import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';

import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/shared/theme/ThemeProvider.tsx';
import { queryClient } from './query-client.ts';

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>{children}</ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
