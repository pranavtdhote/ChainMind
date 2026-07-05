"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/layout/AppLayout";
import { useNotifications } from "../../context/NotificationContext";
import { API_URL } from "@/lib/api";
import {
  Search,
  Grid,
  List,
  Database,
  ArrowRight,
  User,
  Calendar,
  Lock,
  Globe,
  Plus,
  Loader2,
  Clock,
  Layers,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  ShieldAlert,
  Award,
  Link2,
} from "lucide-react";

interface MemoryPassport {
  memoryId: string;
  projectName: string;
  description: string;
  ownerWallet: string;
  creatorAgent: string;
  contributors: string[];
  
  researchArtifact?: any;
  developerArtifact?: any;
  uiArtifact?: any;
  documentationArtifact?: any;
  verificationArtifact?: any;

  projectSummary: string;
  technologies: string[];
  currentVersion: number;
  parentVersion?: string;
  childVersions: string[];
  
  cid: string;
  transactionHash?: string;
  permissionLevel: "Public" | "Private";
  integrityScore: number;
  trustScore: number;
  
  createdAt: string;
  updatedAt: string;
}

interface VersionCommit {
  memoryId: string;
  versionNumber: number;
  parentCid?: string;
  currentCid: string;
  diffSummary: string;
  timestamp: string;
}

export default function MemoryExplorer() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"all" | "public" | "private">("all");

  // Data fetching states
  const [passports, setPassports] = useState<MemoryPassport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uniqueTechs, setUniqueTechs] = useState<string[]>([]);

  // Drawer / Inspection states
  const [selectedPassport, setSelectedPassport] = useState<MemoryPassport | null>(null);
  const [versionHistory, setVersionHistory] = useState<VersionCommit[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeArtifactTab, setActiveArtifactTab] = useState("research");
  const [isDownloadingContext, setIsDownloadingContext] = useState(false);

  // Fetch memory records
  const fetchPassports = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL}/api/memory?limit=50`;
      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }
      if (selectedTech !== "all") {
        url += `&tech=${encodeURIComponent(selectedTech)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch memory records.");

      const result = await response.json();
      if (result.success) {
        setPassports(result.data);
        
        // Extract unique technologies for filter list
        const techs = new Set<string>();
        result.data.forEach((item: MemoryPassport) => {
          if (item.technologies) {
            item.technologies.forEach((t) => techs.add(t));
          }
        });
        setUniqueTechs(Array.from(techs));
      }
    } catch (err: any) {
      console.error(err);
      addNotification("Could not retrieve memory passports.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPassports();
  }, [searchQuery, selectedTech]);

  // Load history commits when a passport is selected
  useEffect(() => {
    if (!selectedPassport) return;
    
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`${API_URL}/api/memory/history/${selectedPassport.memoryId}`);
        if (!response.ok) throw new Error("Failed to fetch commit history.");
        const result = await response.json();
        if (result.success) {
          setVersionHistory(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
    // Default back to first tab
    setActiveArtifactTab(
      selectedPassport.researchArtifact ? "research" : 
      selectedPassport.developerArtifact ? "developer" : 
      selectedPassport.uiArtifact ? "ui" : 
      selectedPassport.documentationArtifact ? "docs" : "verifier"
    );
  }, [selectedPassport]);

  // "Continue Project" Restoration execution
  const handleContinueProject = async (cid: string) => {
    setIsDownloadingContext(true);
    try {
      addNotification("Downloading project context from IPFS...", "info");
      
      const response = await fetch(`${API_URL}/api/memory/download/${cid}`);
      if (!response.ok) throw new Error("IPFS download failed.");
      
      const result = await response.json();
      if (result.success) {
        // Save to cache for Chat page
        localStorage.setItem("chainmind_resume_context", JSON.stringify(result.data));
        
        addNotification("Context reconstructed. Redirecting to swarm chamber...", "success");
        
        // Redirect to chat dashboard
        router.push("/chat");
      }
    } catch (err: any) {
      console.error(err);
      addNotification(`Failed to resume project: ${err.message}`, "error");
    } finally {
      setIsDownloadingContext(false);
    }
  };

  // Filter local tab changes
  const filteredPassports = passports.filter((mem) => {
    if (activeTab === "all") return true;
    if (activeTab === "private") return mem.permissionLevel === "Private";
    if (activeTab === "public") return mem.permissionLevel === "Public";
    return true;
  });

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="h-8 w-8 text-indigo-400" />
            Memory Explorer
          </h1>
          <p className="mt-2 text-gray-400">
            Audit, inspect, and roll back canonical project memories indexed from IPFS.
          </p>
        </div>
        <button 
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Initialize Swarm
        </button>
      </div>

      {/* Tabs, Search, & Filters Panel */}
      <div className="glass-card p-4 mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 self-stretch lg:self-auto">
            {(["all", "public", "private"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-md capitalize transition-colors ${
                  activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:max-w-md flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, CID, description or wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-white/5 rounded-lg bg-white/5 focus:outline-none focus:border-indigo-500/40 text-gray-200"
            />
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-2 border-l border-white/5 pl-4 hidden lg:flex">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${viewMode === "grid" ? "bg-white/10 text-indigo-400" : "text-gray-400 hover:text-white"}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md ${viewMode === "list" ? "bg-white/10 text-indigo-400" : "text-gray-400 hover:text-white"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Technologies Filter Row */}
        {uniqueTechs.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap pt-2 border-t border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Technologies:</span>
            <button
              onClick={() => setSelectedTech("all")}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                selectedTech === "all"
                  ? "bg-indigo-950 text-indigo-400 border-indigo-500/30"
                  : "bg-white/5 border-transparent text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
            {uniqueTechs.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  selectedTech === tech
                    ? "bg-indigo-950 text-indigo-400 border-indigo-500/30"
                    : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="glass-card p-24 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-indigo-400 animate-spin mb-4" />
          <span className="text-sm text-gray-400 font-bold">Scanning IPFS Pinboard entries...</span>
        </div>
      ) : filteredPassports.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Database className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Passports Indexed</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Submit a prompt in the chat swarm workbench to compile and upload a project-memory.json canonical passport.
          </p>
        </div>
      ) : (
        <div className="flex gap-6 items-start">
          {/* Main Grid/List view */}
          <div className="flex-1">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {filteredPassports.map((mem) => (
                  <div 
                    key={mem.memoryId} 
                    onClick={() => setSelectedPassport(mem)}
                    className="glass-card p-6 flex flex-col justify-between cursor-pointer border hover:border-indigo-500/30 transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/50 border border-indigo-500/20 text-indigo-400 font-mono">
                          CID: {mem.cid.substring(0, 8)}...{mem.cid.substring(mem.cid.length - 8)}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          {mem.permissionLevel === "Private" ? (
                            <span className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-950/20 px-2 py-0.5 rounded">
                              <Lock className="h-3 w-3" /> Private
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-950/20 px-2 py-0.5 rounded">
                              <Globe className="h-3 w-3" /> Public
                            </span>
                          )}
                        </div>
                      </div>

                      <h2 className="text-base font-bold text-white mb-2">{mem.projectName}</h2>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-6">
                        {mem.description}
                      </p>

                      {/* Tech stack badges */}
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {mem.technologies?.slice(0, 4).map((tech, idx) => (
                          <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-300">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Award className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="text-gray-300 font-bold">{mem.integrityScore}% integrity</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {filteredPassports.map((mem) => (
                  <div 
                    key={mem.memoryId} 
                    onClick={() => setSelectedPassport(mem)}
                    className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-indigo-500/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">{mem.projectName}</span>
                        <p className="text-xs text-gray-400 truncate max-w-md">{mem.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between md:justify-end text-xs">
                      <span className="font-mono text-gray-500">CID: {mem.cid.substring(0, 10)}...</span>
                      <span className="text-gray-500">{new Date(mem.createdAt).toLocaleDateString()}</span>
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Inspection Drawer Panel */}
          {selectedPassport && (
            <div className="w-108 glass-card p-6 flex flex-col shrink-0 sticky top-4 max-h-[calc(100vh-16rem)] overflow-y-auto border-l border-indigo-500/15">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedPassport.projectName}</h3>
                  <span className="text-[10px] text-gray-500 font-mono">ID: {selectedPassport.memoryId}</span>
                </div>
                <button 
                  onClick={() => setSelectedPassport(null)}
                  className="text-xs font-bold text-gray-500 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handleContinueProject(selectedPassport.cid)}
                  disabled={isDownloadingContext}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isDownloadingContext ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Continue Project
                </button>
                <a
                  href={`https://ipfs.io/ipfs/${selectedPassport.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 p-2.5 text-xs font-bold transition-all"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  View Raw JSON
                </a>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-center">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Integrity Rating</span>
                  <span className="text-base font-mono font-bold text-emerald-400">{selectedPassport.integrityScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-center">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Trust Confidence</span>
                  <span className="text-base font-mono font-bold text-indigo-400">{selectedPassport.trustScore}%</span>
                </div>
              </div>

              {/* Version History Tree */}
              <div className="mb-6">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  Version Commit Ledger
                </span>
                {isLoadingHistory ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600 mx-auto" />
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                    {/* Active passport base */}
                    <div className="flex gap-3 relative items-start">
                      <div className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center border bg-indigo-950 border-indigo-500/30 text-[9px] font-bold text-indigo-400">
                        V{selectedPassport.currentVersion}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white block">Active Head</span>
                          <span className="text-[9px] text-gray-500 font-mono">Current</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed truncate">CID: {selectedPassport.cid}</p>
                      </div>
                    </div>

                    {/* Historical versions list */}
                    {versionHistory.map((commit, idx) => (
                      <div key={idx} className="flex gap-3 relative items-start">
                        <div className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center border bg-white/5 border-transparent text-[9px] text-gray-400">
                          V{commit.versionNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-300 block">Commit Log</span>
                            <span className="text-[9px] text-gray-500 font-mono">
                              {new Date(commit.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-indigo-400/80 font-medium leading-relaxed italic mt-0.5">
                            "{commit.diffSummary}"
                          </p>
                          <button 
                            onClick={() => handleContinueProject(commit.currentCid)}
                            className="text-[9px] text-indigo-400 hover:underline font-bold mt-1 block"
                          >
                            Rollback to this state ➔
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Artifact Viewer tabs */}
              <div className="flex-1 flex flex-col min-h-0">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Artifact Inspector
                </span>
                <div className="flex border-b border-white/5 mb-3 text-xs font-bold overflow-x-auto gap-2">
                  {[
                    { id: "research", label: "research.json", data: selectedPassport.researchArtifact },
                    { id: "developer", label: "implementation.json", data: selectedPassport.developerArtifact },
                    { id: "ui", label: "ui-design.json", data: selectedPassport.uiArtifact },
                    { id: "docs", label: "documentation.json", data: selectedPassport.documentationArtifact },
                    { id: "verifier", label: "verification.json", data: selectedPassport.verificationArtifact }
                  ]
                    .filter((t) => t.data)
                    .map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveArtifactTab(tab.id)}
                        className={`pb-1 border-b-2 transition-all shrink-0 ${
                          activeArtifactTab === tab.id
                            ? "border-indigo-500 text-indigo-400"
                            : "border-transparent text-gray-500 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                </div>

                <div className="flex-1 min-h-[200px] overflow-y-auto p-3 rounded-lg bg-gray-950 border border-white/5 font-mono text-[9px] text-gray-400">
                  {activeArtifactTab === "research" && selectedPassport.researchArtifact && (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedPassport.researchArtifact, null, 2)}</pre>
                  )}
                  {activeArtifactTab === "developer" && selectedPassport.developerArtifact && (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedPassport.developerArtifact, null, 2)}</pre>
                  )}
                  {activeArtifactTab === "ui" && selectedPassport.uiArtifact && (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedPassport.uiArtifact, null, 2)}</pre>
                  )}
                  {activeArtifactTab === "docs" && selectedPassport.documentationArtifact && (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedPassport.documentationArtifact, null, 2)}</pre>
                  )}
                  {activeArtifactTab === "verifier" && selectedPassport.verificationArtifact && (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedPassport.verificationArtifact, null, 2)}</pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
