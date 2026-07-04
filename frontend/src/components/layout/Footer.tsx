import React from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#09090b]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex items-center justify-center gap-2 md:order-1">
          <Cpu className="h-4 w-4 text-zinc-600" />
          <span className="text-[12px] text-zinc-600">
            &copy; {new Date().getFullYear()} ChainMind Protocol
          </span>
        </div>
        <div className="mt-3 flex justify-center items-center space-x-4 md:order-2 md:mt-0">
          <Link href="/health" className="text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors">
            System Status
          </Link>
          <span className="text-zinc-800">·</span>
          <a
            href="https://testnet.monadscan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Monad Explorer
          </a>
          <span className="text-zinc-800">·</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-500 font-medium">
            Testnet 10143
          </span>
        </div>
      </div>
    </footer>
  );
}
