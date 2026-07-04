"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../context/ThemeContext";
import { WalletProvider } from "../context/WalletContext";
import { AgentProvider } from "../context/AgentContext";
import { MemoryProvider } from "../context/MemoryContext";
import { NotificationProvider } from "../context/NotificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Ensure query client is created once per session on the client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <WalletProvider>
            <AgentProvider>
              <MemoryProvider>
                {children}
              </MemoryProvider>
            </AgentProvider>
          </WalletProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
