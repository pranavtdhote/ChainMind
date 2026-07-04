"use client";

import React, { useEffect } from "react";
import { ShieldAlert, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or logging service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-zinc-100 px-4 text-center">
      <div className="glass-card p-10 max-w-md w-full">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 mb-6">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-[13px] text-zinc-500 leading-relaxed mb-8">
          A runtime error occurred in the interface. This is usually temporary and can be resolved by retrying.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-[13px] font-medium transition-all shadow-sm focus-ring"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-300 py-2.5 text-[13px] font-medium transition-all border border-white/[0.06]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
