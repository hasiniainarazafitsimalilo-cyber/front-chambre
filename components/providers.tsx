"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30s
            retry: (failureCount, error) => {
              if (error instanceof Error) {
                const msg = error.message.toLowerCase();
                if (
                  msg.includes("401") ||
                  msg.includes("403") ||
                  msg.includes("unauthorized") ||
                  msg.includes("forbidden")
                ) {
                  return false;
                }
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              border: "1px solid var(--line)",
              color: "var(--foreground)",
              fontSize: "13px",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-md)",
            },
          }}
          closeButton
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
