"use client";

import React from "react";
import { Cpu } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-zinc-100 px-4">
      <div className="relative flex items-center justify-center h-20 w-20">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10 border-t-indigo-500/60 animate-spin" style={{ animationDuration: '1.2s' }}></div>
        {/* Inner pulse */}
        <div className="absolute inset-3 rounded-full bg-indigo-500/5 border border-indigo-500/10"></div>
        {/* Icon */}
        <Cpu className="relative h-6 w-6 text-indigo-400 animate-pulse" />
      </div>
      <div className="mt-8 flex flex-col items-center gap-1.5">
        <h2 className="text-[13px] font-semibold tracking-wide text-zinc-400">
          Loading interface...
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-[11px] text-zinc-600 font-mono">Connecting to Monad RPC</p>
        </div>
      </div>
    </div>
  );
}
