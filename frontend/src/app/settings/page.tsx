"use client";

import React, { useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useTheme } from "../../context/ThemeContext";
import { useWallet } from "../../context/WalletContext";
import { useNotifications } from "../../context/NotificationContext";
import { Settings, Shield, Bell, Network, Cpu, Database, Save } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { walletAddress, isConnected } = useWallet();
  const { addNotification } = useNotifications();

  // Settings states
  const [groqKey, setGroqKey] = useState("gsk_val_xxxxxxxxxxxxxxxx");
  const [rpcUrl, setRpcUrl] = useState("https://testnet-rpc.monad.xyz");
  const [ipfsEndpoint, setIpfsEndpoint] = useState("https://api.pinata.cloud");

  // Notification preferences
  const [emailNotif, setEmailNotif] = useState(false);
  const [browserNotif, setBrowserNotif] = useState(true);
  const [onChainNotif, setOnChainNotif] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification("Configuration settings saved successfully", "success");
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="mt-2 text-gray-400">
          Configure API credentials, smart contract RPC nodes, storage gateways, and alert systems.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* Core Config */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" /> AI Inference Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Groq API Key</label>
              <input
                type="password"
                placeholder="Enter Groq API Key"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-white/5 rounded-lg bg-white/5 focus:outline-none focus:border-indigo-500/40 text-gray-200 font-mono"
              />
              <span className="block text-[10px] text-gray-500 mt-1">Used by the Express backend for multi-agent swarm conversations.</span>
            </div>
          </div>
        </div>

        {/* Web3 Network settings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-400" /> Blockchain Network (Web3)
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Monad RPC Node URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={rpcUrl}
                  onChange={(e) => setRpcUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-white/5 rounded-lg bg-white/5 focus:outline-none focus:border-indigo-500/40 text-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">IPFS API Endpoint</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={ipfsEndpoint}
                  onChange={(e) => setIpfsEndpoint(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-white/5 rounded-lg bg-white/5 focus:outline-none focus:border-indigo-500/40 text-gray-200 font-mono"
                />
              </div>
            </div>
            <div className="pt-2">
              <span className="block text-xs text-gray-500 font-bold uppercase mb-2">Connected Wallet</span>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300 font-mono">
                {isConnected && walletAddress ? walletAddress : "No wallet connected. Connect in header."}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notifications config */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-400" /> Alert Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02] cursor-pointer">
                <span className="text-sm font-semibold text-gray-300">Browser Toast Alerts</span>
                <input
                  type="checkbox"
                  checked={browserNotif}
                  onChange={(e) => setBrowserNotif(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500/30"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02] cursor-pointer">
                <span className="text-sm font-semibold text-gray-300">On-Chain Event Notifications</span>
                <input
                  type="checkbox"
                  checked={onChainNotif}
                  onChange={(e) => setOnChainNotif(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500/30"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02] cursor-pointer">
                <span className="text-sm font-semibold text-gray-300">Email System Reports</span>
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500/30"
                />
              </label>
            </div>
          </div>

          {/* Theme setting */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" /> UI Customization
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Theme</span>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 max-w-[200px]">
                  <button
                    type="button"
                    onClick={() => theme === "light" && toggleTheme()}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${
                      theme === "dark" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => theme === "dark" && toggleTheme()}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${
                      theme === "light" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>
              <span className="block text-xs text-gray-500 leading-relaxed">
                Toggle display theme preferences. Default is Dark theme optimized for modern AI SaaS aesthetics.
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-indigo-500/10"
          >
            <Save className="h-4.5 w-4.5" /> Save Configuration
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
