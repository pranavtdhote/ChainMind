"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Link from "next/link";
import {
  Users,
  Activity,
  Layers,
  Award,
  Database,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  History,
  CheckCircle,
  RefreshCw,
  Zap,
  Clock,
  Link2
} from "lucide-react";
import { formatAddress } from "../../constants/wallet";

import { API_BASE_URL } from "@/config/api";

const API_URL = `${API_BASE_URL}/api`;

interface IAnalytics {
  totalProjects: number;
  activeSwarms: number;
  avgConsensus: number;
  memoryUsageMB: number;
  gasPriceGwei: string;
  latencyMs: number;
  latestBlock: number;
  registeredAgents: number;
  totalTasks: number;
  totalMemories: number;
  totalVerifications: number;
  transactionCount: number;
}

interface IActivity {
  type: string;
  description: string;
  txHash: string;
  createdAt: string;
}

interface ILeaderboard {
  rank: number;
  walletAddress: string;
  name: string;
  role: string;
  avatar: string;
  xp: number;
  level: number;
  title: string;
  reputation: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<IAnalytics>({
    totalProjects: 18,
    activeSwarms: 4,
    avgConsensus: 78,
    memoryUsageMB: 512,
    gasPriceGwei: "0.15",
    latencyMs: 35,
    latestBlock: 1420932,
    registeredAgents: 4,
    totalTasks: 4,
    totalMemories: 5,
    totalVerifications: 3,
    transactionCount: 18
  });

  const [activities, setActivities] = useState<IActivity[]>([]);
  const [leaderboard, setLeaderboard] = useState<ILeaderboard[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);

    try {
      // 1. Fetch Analytics
      const resStats = await fetch(`${API_URL}/analytics`);
      const jsonStats = await resStats.json();
      if (jsonStats.success) {
        setStats(jsonStats.data);
      }

      // 2. Fetch Activities
      const resAct = await fetch(`${API_URL}/system/activities`);
      const jsonAct = await resAct.json();
      if (jsonAct.success) {
        setActivities(jsonAct.data);
      }

      // 3. Fetch Leaderboard
      const resLead = await fetch(`${API_URL}/agents/leaderboard`);
      const jsonLead = await resLead.json();
      if (jsonLead.success) {
        setLeaderboard(jsonLead.data);
      }
    } catch (err) {
      console.error("[Dashboard]: Failed to fetch dashboard data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 8000); // Poll every 8 seconds

    return () => clearInterval(timer);
  }, []);

  const statsCards = [
    { name: "Registered Swarm Agents", value: `${stats.registeredAgents} Agents`, icon: Users, desc: "On-chain identities", color: "text-indigo-400" },
    { name: "Swarm Tasks Completed", value: `${stats.totalTasks} Tasks`, icon: Cpu, desc: "Autonomous executions", color: "text-purple-400" },
    { name: "IPFS Memory Passports", value: `${stats.totalMemories} CIDs`, icon: Layers, desc: "Immutable storage", color: "text-emerald-400" },
    { name: "AgentCourt Avg Consensus", value: `${stats.avgConsensus}%`, icon: Award, desc: "Trial accuracy rating", color: "text-amber-400" },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1.5 text-zinc-500 text-[13px]">
            Real-time metrics, collaboration workflows, and Monad telemetry.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={isRefreshing}
          className="self-start sm:self-auto flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] text-zinc-400 border border-white/[0.06] px-3.5 py-2 text-[12px] font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.06em]">{stat.name}</span>
                <div className={`p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] ${stat.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl font-bold text-white tracking-tight">{stat.value}</span>
                <span className="block mt-1 text-[10px] text-zinc-600">{stat.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Trends & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
        {/* SVG Performance Trends chart */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[15px] font-semibold text-white">Trust Loop Activity</h3>
                <p className="text-[11px] text-zinc-600 mt-0.5">Transaction progression vs block updates</p>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-indigo-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Tasks
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Verifications
                </span>
              </div>
            </div>

            {/* Custom SVG line chart */}
            <div className="relative w-full h-48 border-b border-l border-white/5 mb-4 px-2">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.02)" strokeWidth="0.2" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.02)" strokeWidth="0.2" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.02)" strokeWidth="0.2" />
                
                {/* Completed Line */}
                <path
                  d="M 0 35 L 20 31 L 40 20 L 60 25 L 80 14 L 100 8"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Approved Line */}
                <path
                  d="M 0 37 L 20 33 L 40 24 L 60 27 L 80 16 L 100 11"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-4 border-t border-white/5">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>
          </div>
        </div>

        {/* Reputation Leaderboard */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-white mb-4">Reputation Ranking</h3>
            <div className="space-y-2">
              {leaderboard.slice(0, 4).map((entry) => (
                <div
                  key={entry.walletAddress}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-600 font-mono w-5">#{entry.rank}</span>
                    <img
                      src={entry.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.name}`}
                      alt={entry.name}
                      className="h-7 w-7 rounded-md bg-zinc-900 border border-white/[0.06] p-0.5"
                    />
                    <div>
                      <span className="block text-[12px] font-medium text-white truncate max-w-[100px]">{entry.name}</span>
                      <span className="text-[10px] text-zinc-600 block">{entry.title} · Lvl {entry.level}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[12px] font-semibold text-indigo-400">{entry.xp} XP</span>
                    <span className="text-[10px] text-zinc-600">{entry.reputation} Rep</span>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center py-8 text-[12px] text-zinc-600">
                  No active agent data scored yet.
                </div>
              )}
            </div>
          </div>
          <Link href="/agents" className="mt-4 w-full py-2 text-center text-[12px] font-medium text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/[0.1] rounded-lg transition-all">
            View Registry →
          </Link>
        </div>
      </div>

      {/* Bottom Row: Recent Swarm Activity & Infrastructure Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity Logs */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <History className="h-4 w-4 text-zinc-500" /> Activity Feed
            </h3>
            <span className="text-[11px] text-emerald-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-white/[0.04] text-zinc-600 text-[11px] font-medium uppercase tracking-[0.04em]">
                  <th className="py-2.5">Event</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5 text-right">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {activities.slice(0, 5).map((act, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border tracking-wide ${
                          act.type === "MemoryRegister" || act.type === "MemoryRegister"
                            ? "bg-indigo-500/8 text-indigo-400 border-indigo-500/15"
                            : act.type === "VoteSubmit" || act.type === "VerificationInitiate"
                            ? "bg-emerald-500/8 text-emerald-400 border-emerald-500/15"
                            : act.type === "TaskCreate" || act.type === "TaskComplete"
                            ? "bg-purple-500/8 text-purple-400 border-purple-500/15"
                            : "bg-zinc-500/8 text-zinc-400 border-zinc-500/15"
                        }`}
                      >
                        {act.type}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400 text-[12px] max-w-sm truncate">
                      {act.description}
                    </td>
                    <td className="py-3 text-zinc-600 text-[11px] font-mono">
                      {new Date(act.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 text-right font-mono text-[12px] text-zinc-500">
                      <a 
                        href={`https://testnet.monadscan.com/tx/${act.txHash}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="hover:text-indigo-400 flex items-center justify-end gap-1 transition-colors"
                      >
                        {formatAddress(act.txHash)} <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
                {activities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-[12px] text-zinc-600">
                      No system events captured yet. Run an agent task to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Infrastructure Status Panel */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-white mb-4">Network Status</h3>
            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-400">Block Height</span>
                <span className="text-[12px] font-mono font-semibold text-white">#{stats.latestBlock}</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-400">Gas Fee</span>
                <span className="text-[12px] font-mono font-semibold text-emerald-400">{stats.gasPriceGwei} Gwei</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-400">Latency</span>
                <span className="text-[12px] font-mono font-semibold text-indigo-400">{stats.latencyMs}ms</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-400">IPFS Gateway</span>
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </span>
              </div>
            </div>
          </div>
          <Link href="/health" className="mt-5 w-full py-2 text-center text-[12px] font-medium text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/[0.1] rounded-lg transition-all">
            Health Center →
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
