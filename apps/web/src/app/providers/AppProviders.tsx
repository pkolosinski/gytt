import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

import { ThemeProvider } from '@/shared/theme/theme.tsx';

import { queryClient } from './query-client.ts';

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    {children}
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
