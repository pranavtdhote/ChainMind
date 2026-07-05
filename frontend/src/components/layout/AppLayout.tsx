"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { API_BASE_URL } from "@/config/api";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      // Use controller abort to set a timeout of 5 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${API_BASE_URL}/api/system/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setIsBackendDown(false);
      } else {
        setIsBackendDown(true);
      }
    } catch (err) {
      console.warn("Backend health check failed:", err);
      setIsBackendDown(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
      {/* Top Header Navigation */}
      <Navbar />

      {/* Backend Down Warning Banner */}
      {isBackendDown && (
        <div className="w-full bg-red-950/80 border-b border-red-500/30 px-6 py-2 flex items-center justify-between text-xs text-red-200 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span><strong>Backend Offline:</strong> The ChainMind Swarm Orchestrator is currently offline. Swarm executions and database updates are running in mock fallback mode.</span>
          </div>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-900/30 hover:bg-red-900/50 border border-red-500/20 hover:border-red-500/40 rounded transition-all text-[11px] font-bold text-red-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${checking ? "animate-spin" : ""}`} />
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10 scrollbar-thin">
          <div className="mx-auto max-w-[1280px]">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
