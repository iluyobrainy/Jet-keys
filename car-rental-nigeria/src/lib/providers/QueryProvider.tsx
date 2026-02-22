// lib/providers/QueryProvider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useState } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimized for production performance
            staleTime: 5 * 60 * 1000, // 5 minutes - reduce refetching
            gcTime: 10 * 60 * 1000, // 10 minutes - keep data longer
            refetchOnWindowFocus: false, // Disable refetch on window focus
            refetchOnMount: false, // Disable refetch on mount if data exists
            refetchOnReconnect: 'always', // Only refetch on reconnect
            retry: (failureCount, error) => {
              // Smart retry logic
              if (error instanceof Error && 'status' in error) {
                const status = (error as any).status
                // Don't retry on 4xx errors (client errors)
                if (status >= 400 && status < 500) {
                  return false
                }
                // Retry 5xx errors up to 2 times
                if (status >= 500) {
                  return failureCount < 2
                }
              }
              // Network errors - retry up to 3 times
              return failureCount < 3
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: false, // Don't retry mutations
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
