import { QueryClient } from '@tanstack/react-query';

import { TaskApiError } from '@/features/tasks/index.ts';

const MAX_RETRIES = 3;

/** Retries transient failures only; validation, conflict, and not-found errors are final. */
function shouldRetry(failureCount: number, error: Error): boolean {
    if (error instanceof TaskApiError && error.code !== 'STORAGE_UNAVAILABLE') {
        return false;
    }
    return failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        mutations: { retry: false },
        queries: { retry: shouldRetry, staleTime: 30_000 },
    },
});
