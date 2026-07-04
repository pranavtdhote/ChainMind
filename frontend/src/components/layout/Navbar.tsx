"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "../../context/WalletContext";
import { useTheme } from "../../context/ThemeContext";
import { Menu, X, Wallet, Sun, Moon, Cpu, Circle } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { walletAddress, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Chat Swarm", href: "/chat" },
    { name: "Memory", href: "/memory" },
    { name: "AgentCourt", href: "/agentcourt" },
    { name: "Agents", href: "/agents" },
    { name: "Analytics", href: "/analytics" },
    { name: "Timeline", href: "/timeline" },
    { name: "Health", href: "/health" },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.04] bg-[#09090b]/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/15 group-hover:border-indigo-500/25 transition-colors">
              <Cpu className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-white leading-none tracking-tight">
                ChainMind
              </span>
              <span className="text-[9px] text-zinc-600 font-medium mt-0.5 tracking-wider uppercase">
                Protocol
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? "text-white bg-white/[0.06]"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Network indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.04]">
            <Circle className="h-1.5 w-1.5 fill-emerald-400 text-emerald-400" />
            <span className="text-[10px] font-medium text-zinc-500">Monad</span>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors focus-ring"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={handleWalletClick}
            disabled={isConnecting}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 focus-ring ${
              isConnected
                ? "bg-white/[0.04] border border-white/[0.06] text-zinc-300 hover:bg-white/[0.06]"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20"
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            {isConnecting
              ? "Connecting..."
              : isConnected && walletAddress
              ? formatAddress(walletAddress)
              : "Connect Wallet"}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.04] bg-[#09090b]/95 backdrop-blur-xl px-4 py-3 space-y-1">
          <nav className="flex flex-col gap-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    isActive ? "bg-white/[0.06] text-white" : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-white/[0.04] pt-3 mt-2">
            <button
              onClick={() => {
                handleWalletClick();
                setMobileMenuOpen(false);
              }}
              disabled={isConnecting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-[13px] font-medium shadow-sm transition-all duration-200"
            >
              <Wallet className="h-3.5 w-3.5" />
              {isConnecting
                ? "Connecting..."
                : isConnected && walletAddress
                ? formatAddress(walletAddress)
                : "Connect Wallet"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
