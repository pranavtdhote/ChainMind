import React from "react";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-zinc-100 px-4 text-center">
      <div className="glass-card p-10 max-w-md w-full">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/50 border border-white/[0.06] text-zinc-500 mb-6">
          <Search className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Page not found</h2>
        <p className="text-[13px] text-zinc-500 leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] text-zinc-300 py-2.5 text-[13px] font-medium transition-all border border-white/[0.06] focus-ring"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
