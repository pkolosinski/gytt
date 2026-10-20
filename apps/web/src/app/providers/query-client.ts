import { QueryClient } from '@tanstack/react-query';

const MAX_RETRIES = 3;

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
    queries: { retry: MAX_RETRIES, staleTime: 30_000 },
  },
});
