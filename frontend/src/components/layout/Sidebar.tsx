"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  ShieldCheck,
  Users,
  BarChart3,
  Calendar,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const mainItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat Swarm", href: "/chat", icon: MessageSquare },
    { name: "Memory Explorer", href: "/memory", icon: Database },
    { name: "AgentCourt", href: "/agentcourt", icon: ShieldCheck },
    { name: "Agent Profiles", href: "/agents", icon: Users },
  ];

  const insightItems = [
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Project Timeline", href: "/timeline", icon: Calendar },
    { name: "System Health", href: "/health", icon: Activity },
  ];

  const systemItems = [
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const renderItem = (item: { name: string; href: string; icon: any }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        title={collapsed ? item.name : undefined}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? "bg-white/[0.06] text-white shadow-sm"
            : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
        }`}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500" />
        )}
        <Icon
          className={`h-[18px] w-[18px] shrink-0 transition-colors ${
            isActive ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"
          }`}
        />
        {!collapsed && (
          <span className="truncate">{item.name}</span>
        )}
      </Link>
    );
  };

  const renderSection = (label: string, items: any[]) => (
    <div className="space-y-0.5">
      {!collapsed && (
        <div className="px-3 pt-4 pb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-600">
            {label}
          </span>
        </div>
      )}
      {collapsed && <div className="pt-3" />}
      {items.map(renderItem)}
    </div>
  );

  return (
    <aside
      className={`relative hidden md:flex flex-col border-r border-white/[0.04] bg-[#09090b] transition-all duration-300 ease-in-out ${
        collapsed ? "w-[60px]" : "w-[240px]"
      }`}
    >
      {/* Brand */}
      <div className={`flex items-center gap-2.5 px-4 h-16 border-b border-white/[0.04] ${collapsed ? "justify-center" : ""}`}>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 shrink-0">
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-white leading-tight tracking-tight">
              ChainMind
            </span>
            <span className="text-[9px] text-zinc-600 font-medium tracking-wider uppercase">
              Protocol v1.0
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {renderSection("Workspace", mainItems)}
        {renderSection("Insights", insightItems)}
        {renderSection("System", systemItems)}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-white/[0.04] p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-zinc-600 hover:bg-white/[0.03] hover:text-zinc-400 transition-all text-xs"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
