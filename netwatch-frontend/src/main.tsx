import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "@/styles/global.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30000, // Poll every 30 seconds for real-time updates
      staleTime: 10000, // Consider data fresh for 10 seconds
      retry: 1, // Retry failed requests once
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={clerkPubKey} signInUrl="/sign-in" signUpUrl="/sign-up">
        <App />
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>,
)
