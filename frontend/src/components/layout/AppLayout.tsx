"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { API_URL } from "@/lib/api";
import { AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface HealthStatus {
  success: boolean;
  status: string;
  service: string;
  database: string;
  version: string;
  timestamp: string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking");
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);

  const checkHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${API_URL}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
        if (data.status === "online" || data.success === true || data.status === "ok") {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
      {/* Top Header Navigation */}
      <Navbar />

      {/* Backend Status Banner */}
      {backendStatus === "offline" && (
        <div className="w-full bg-red-950/80 border-b border-red-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-red-200 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>
              <strong>Backend Unavailable:</strong> Cannot reach the ChainMind API server. Please verify the backend is running and try again.
            </span>
          </div>
          <button
            onClick={checkHealth}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/20 hover:border-red-500/40 rounded transition-all text-[11px] font-bold text-red-300"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {healthData && healthData.database === "disconnected" && backendStatus === "online" && (
        <div className="w-full bg-amber-950/80 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-200 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Database Disconnected:</strong> MongoDB is not reachable. Data persistence is unavailable.
            </span>
          </div>
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
