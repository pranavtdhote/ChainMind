"use client";

import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import { Calendar, CheckCircle2, Circle, Clock, GitCommit, Layers } from "lucide-react";

export default function ProjectTimeline() {
  const projects = [
    {
      name: "Smart Contract Audit Swarm",
      id: "p1",
      status: "Running",
      milestones: [
        { title: "Define Requirements & Prompts", status: "completed", date: "Jul 4, 09:00", description: "System scope mapped out by human overseer." },
        { title: "Agent Swarm Provisioning", status: "completed", date: "Jul 4, 10:00", description: "Architect, Coder, and Auditor wallets registered." },
        { title: "Code & Audit Execution Loop", status: "active", date: "Jul 4, 11:30", description: "Agents reviewing schemas and executing verification tests." },
        { title: "AgentCourt Verification", status: "pending", date: "Pending", description: "Audit votes will resolve tasks based on consensus score." },
        { title: "IPFS Sync & Monad Registry", status: "pending", date: "Pending", description: "Write final state signatures to block ledger." },
      ],
    },
    {
      name: "Market Research Analyzer",
      id: "p2",
      status: "Completed",
      milestones: [
        { title: "Define Prompts & Targets", status: "completed", date: "Jul 2, 08:00", description: "Arbitrage paths and market feed locations specified." },
        { title: "Agent Swarm Provisioning", status: "completed", date: "Jul 2, 09:30", description: "Fetcher Agent and Analyzer Agent registered." },
        { title: "Data Gathering & Analysis", status: "completed", date: "Jul 2, 11:00", description: "Fetcher fetched feeds; Analyzer generated summaries." },
        { title: "AgentCourt Verification", status: "completed", date: "Jul 2, 14:00", description: "Consensus resolved case #231 as Approved." },
        { title: "IPFS Sync & Monad Registry", status: "completed", date: "Jul 2, 14:15", description: "CIDs registered on MemoryRegistry.sol (Tx: 0x28af...)" },
      ],
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Project Timeline</h1>
        <p className="mt-2 text-gray-400">
          Track the detailed collaborative execution history and pipeline stages of active swarms.
        </p>
      </div>

      <div className="space-y-10">
        {projects.map((proj) => (
          <div key={proj.id} className="glass-card p-6">
            {/* Project Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-650/10 border border-indigo-500/25 text-indigo-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{proj.name}</h3>
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">Project ID: {proj.id}</span>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                  proj.status === "Completed"
                    ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/20"
                    : "bg-indigo-950/50 text-indigo-450 border border-indigo-500/20 animate-pulse"
                }`}
              >
                {proj.status}
              </span>
            </div>

            {/* Vertical timeline */}
            <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 pb-2">
              {proj.milestones.map((m, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline status indicator */}
                  <span className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 border border-white/10">
                    {m.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : m.status === "active" ? (
                      <Clock className="h-5 w-5 text-indigo-400 animate-spin" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-600" />
                    )}
                  </span>

                  <div>
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                      <h4 className={`text-sm font-bold ${m.status === "completed" ? "text-white" : m.status === "active" ? "text-indigo-400 font-extrabold" : "text-gray-500"}`}>
                        {m.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {m.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
