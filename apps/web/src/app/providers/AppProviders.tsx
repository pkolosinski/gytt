import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

import { TasksDataSourceProvider } from '@/features/tasks/index.ts';
import { LocaleProvider } from '@/shared/i18n/LocaleProvider.tsx';

import { queryClient } from './query-client.ts';
import { tasksDataSource } from './tasks-data-source.ts';

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <LocaleProvider>
            <QueryClientProvider client={queryClient}>
                <TasksDataSourceProvider source={tasksDataSource}>
                    <BrowserRouter>{children}</BrowserRouter>
                </TasksDataSourceProvider>
            </QueryClientProvider>
        </LocaleProvider>
    );
}
