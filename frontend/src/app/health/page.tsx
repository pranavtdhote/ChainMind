"use client";

import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import { Activity, Server, Database, Globe, Cpu, Wallet, RefreshCw } from "lucide-react";

export default function SystemHealth() {
  const healthCards = [
    {
      name: "Monad Testnet Node",
      icon: Globe,
      status: "Healthy",
      latency: "24 ms",
      uptime: "99.98%",
      details: [
        { label: "Chain ID", value: "10143" },
        { label: "Block Height", value: "2,481,209" },
        { label: "Gas Limit", value: "30,000,000" },
      ],
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/20",
    },
    {
      name: "Groq LLM Inference API",
      icon: Cpu,
      status: "Healthy",
      latency: "185 ms",
      uptime: "99.95%",
      details: [
        { label: "Active Model", value: "llama3-70b-8192" },
        { label: "Rate Limit", value: "14,400 RPM" },
        { label: "Token Limit", value: "40,000 TPM" },
      ],
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/20",
    },
    {
      name: "IPFS Gateway (Pinata)",
      icon: Database,
      status: "Healthy",
      latency: "94 ms",
      uptime: "99.90%",
      details: [
        { label: "Access Token", value: "Configured" },
        { label: "Storage Used", value: "4.82 GB" },
        { label: "Pin Count", value: "248 files" },
      ],
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/20",
    },
    {
      name: "Express.js Orchestrator API",
      icon: Server,
      status: "Healthy",
      latency: "12 ms",
      uptime: "99.99%",
      details: [
        { label: "Environment", value: "Development" },
        { label: "Socket Connected", value: "14 clients" },
        { label: "Node Version", value: "v20.11.0" },
      ],
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/20",
    },
    {
      name: "MongoDB Database Instance",
      icon: Database,
      status: "Healthy",
      latency: "4 ms",
      uptime: "100.00%",
      details: [
        { label: "Connection Status", value: "Connected" },
        { label: "Replica Sets", value: "0" },
        { label: "Document Count", value: "1,290" },
      ],
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/20",
    },
    {
      name: "Wallet Connection Status",
      icon: Wallet,
      status: "Active",
      latency: "Connected",
      uptime: "MetaMask",
      details: [
        { label: "Provider Type", value: "EIP-1193" },
        { label: "Selected Chain ID", value: "10143" },
        { label: "Account Address", value: "0x71C7...976F" },
      ],
      color: "border-indigo-500/20 text-indigo-400 bg-indigo-950/20",
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-7 w-7 text-indigo-400" /> System Health Monitor
          </h1>
          <p className="mt-2 text-gray-400">
            Real-time status indicators, query latency, and node states for ChainMind infrastructure.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 self-start md:self-auto">
          <RefreshCw className="h-4 w-4" /> Refresh Status
        </button>
      </div>

      {/* Grid of Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`glass-card p-6 border ${card.color}`}>
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{card.name}</h3>
                    <span className="text-[10px] text-gray-450 block mt-0.5">Uptime: {card.uptime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded border border-white/5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase">{card.status}</span>
                </div>
              </div>

              {/* Body Details */}
              <div className="space-y-2 mb-4">
                {card.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex justify-between text-xs">
                    <span className="text-gray-500">{detail.label}</span>
                    <span className="text-gray-300 font-mono font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Latency */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                <span>Response latency</span>
                <span className="font-bold text-gray-400 font-mono">{card.latency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
