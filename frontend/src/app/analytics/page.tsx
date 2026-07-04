"use client";

import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import { BarChart3, TrendingUp, Cpu, Database, Zap, Activity } from "lucide-react";

export default function Analytics() {
  // Activity Heatmap dummy grid (7 days x 12 weeks)
  const heatmapRows = Array.from({ length: 7 });
  const heatmapCols = Array.from({ length: 18 });

  // Mock function to determine heat intensity color
  const getHeatColor = (r: number, c: number) => {
    const intensity = (r * c + 5) % 5;
    if (intensity === 0) return "bg-indigo-950/20 border-white/5";
    if (intensity === 1) return "bg-indigo-900/40 border-indigo-500/10";
    if (intensity === 2) return "bg-indigo-755/60 border-indigo-500/20";
    if (intensity === 3) return "bg-indigo-600/80 border-indigo-500/30";
    return "bg-indigo-500 border-indigo-400";
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">System Analytics</h1>
        <p className="mt-2 text-gray-400">
          Swarm execution volumes, consensus scores, memory storage growth, and Monad RPC gas usage.
        </p>
      </div>

      {/* Grid Layout of Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Project Analytics */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" /> Project Success Analytics
          </h3>
          <div className="relative w-full h-40 border-b border-l border-white/5 px-2 flex items-end justify-between gap-4">
            {[45, 68, 89, 72, 92, 118].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-t transition-all duration-300"
                  style={{ height: `${val}%` }}
                ></div>
                <span className="text-[10px] text-gray-500 font-mono mt-2">M{idx + 1}</span>
              </div>
            ))}
          </div>
          <span className="block mt-4 text-xs text-gray-500">Task completion volume by month (M1-M6).</span>
        </div>

        {/* Memory Analytics */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" /> Memory Passport Growth (IPFS)
          </h3>
          <div className="relative w-full h-40 border-b border-l border-white/5 px-2">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path
                d="M 0 35 Q 20 28 40 22 T 80 8 T 100 2"
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 35 Q 20 28 40 22 T 80 8 T 100 2 L 100 40 L 0 40 Z"
                fill="url(#purple-grad)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="purple-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="block mt-4 text-xs text-gray-500">Cumulative memory payloads (MBs pinned).</span>
        </div>

        {/* Monad Gas/Transaction Volume */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" /> Monad Network Activity
          </h3>
          <div className="relative w-full h-40 border-b border-l border-white/5 px-2">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path
                d="M 0 38 L 15 20 L 30 35 L 50 10 L 70 28 L 85 5 L 100 12"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="block mt-4 text-xs text-gray-500">Monad testnet transactions per block.</span>
        </div>

        {/* Agent Efficiency Score */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-amber-400" /> Agent Accuracy & Consensus Score
          </h3>
          <div className="space-y-4">
            {[
              { name: "Coder Agent V2", score: 99.1, color: "bg-indigo-500" },
              { name: "Architect Agent", score: 98.4, color: "bg-purple-500" },
              { name: "Auditor Agent", score: 96.5, color: "bg-emerald-500" },
              { name: "Summarizer Agent", score: 94.2, color: "bg-amber-500" },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
                  <span>{item.name}</span>
                  <span>{item.score}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Heatmap Grid */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-400" /> Swarm Execution Heatmap
        </h3>
        <p className="text-xs text-gray-500 mb-6">Distribution of task requests, memory storage pins, and voting audits across the week.</p>
        
        <div className="flex flex-col gap-1 overflow-x-auto pb-2">
          {heatmapRows.map((_, rIdx) => (
            <div key={rIdx} className="flex gap-1 min-w-[500px]">
              {heatmapCols.map((_, cIdx) => (
                <div
                  key={cIdx}
                  className={`h-4 w-4 rounded-sm border transition-colors ${getHeatColor(rIdx, cIdx)}`}
                  title={`Swarm Events: ${rIdx * cIdx}`}
                ></div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500 mt-4 font-mono">
          <span>Less active</span>
          <div className="flex gap-1 items-center">
            <span className="h-3 w-3 rounded-sm bg-indigo-950/20 border border-white/5"></span>
            <span className="h-3 w-3 rounded-sm bg-indigo-900/40 border border-indigo-500/10"></span>
            <span className="h-3 w-3 rounded-sm bg-indigo-755/60 border border-indigo-500/20"></span>
            <span className="h-3 w-3 rounded-sm bg-indigo-600/80 border border-indigo-500/30"></span>
            <span className="h-3 w-3 rounded-sm bg-indigo-500 border border-indigo-400"></span>
          </div>
          <span>Highly active</span>
        </div>
      </div>
    </AppLayout>
  );
}
