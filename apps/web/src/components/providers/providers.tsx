'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { PocketBaseProvider } from './pocketbase-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        // Bound worst-case latency: 3 default retries + exponential backoff
        // made a failing/unreachable backend feel like ~7s hangs per query.
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <PocketBaseProvider>
          {children}
        </PocketBaseProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
