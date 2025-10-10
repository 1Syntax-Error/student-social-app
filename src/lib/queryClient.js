// src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 15 minutes (increased from 5)
      staleTime: 15 * 60 * 1000,
      // Keep unused data in cache for 30 minutes (increased from 10)
      gcTime: 30 * 60 * 1000,
      // Retry failed requests twice
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus to reduce database calls
      refetchOnWindowFocus: false,
      // Refetch on reconnect only if data is stale
      refetchOnReconnect: 'always',
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Enable network mode to handle offline scenarios
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});
