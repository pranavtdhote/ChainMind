"use client";

import React, { useState, useEffect, useRef } from "react";
import AppLayout from "../../components/layout/AppLayout";
import {
  Send,
  MessageSquare,
  Cpu,
  Layers,
  Sparkles,
  Compass,
  CheckCircle,
  Database,
  Search,
  BookOpen,
  Code,
  Layout,
  FileText,
  ShieldCheck,
  Loader2,
  Clock,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import { useNotifications } from "../../context/NotificationContext";
import { API_BASE_URL } from "@/config/api";

interface SwarmTask {
  id: string;
  agentRole: "Manager" | "Research" | "Developer" | "UI Designer" | "Documentation" | "Verifier";
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Running" | "Completed" | "Failed";
}

interface SwarmLog {
  step: string;
  agentRole?: string;
  status: "started" | "completed" | "failed" | "info";
  message: string;
  timestamp: number;
}

interface SharedContext {
  projectName: string;
  userGoal: string;
  requirements: string[];
  currentTask: string;
  completedTasks: string[];
  pendingTasks: string[];
  researchOutput?: any;
  developerOutput?: any;
  uiOutput?: any;
  documentation?: any;
  verificationOutput?: any;
  agentHistory: Array<{
    agentId: string;
    agentName: string;
    role: string;
    action: string;
    timestamp: number;
  }>;
  currentStatus: string;
  timestamp: number;
  contextVersion: number;
}

interface ConversationSummary {
  conversationId: string;
  prompt: string;
  projectName: string;
  cid: string;
  createdAt: string;
}

export default function ChatSwarm() {
  const { isConnected, walletAddress } = useWallet();
  const { addNotification } = useNotifications();

  const [inputText, setInputText] = useState("");
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [logs, setLogs] = useState<SwarmLog[]>([]);
  const [tasks, setTasks] = useState<SwarmTask[]>([]);
  const [context, setContext] = useState<SharedContext | null>(null);
  const [selectedArtifactTab, setSelectedArtifactTab] = useState<string>("research");
  const [activeChatTopic, setActiveChatTopic] = useState<string>("ChainMind Swarm Engine");
  const [selectedModuleIdx, setSelectedModuleIdx] = useState<number>(0);
  const [conversationHistory, setConversationHistory] = useState<ConversationSummary[]>([]);

  const streamEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when logs or context changes
  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, currentStep]);

  // Load restored context on mount
  useEffect(() => {
    const cached = localStorage.getItem("chainmind_resume_context");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setContext(parsed);
        setLogs([
          {
            step: "Manager",
            status: "completed",
            message: `Restored swarm session "${parsed.projectName}" from IPFS memory passport. Select tabs on the right to inspect knowledge base.`,
            timestamp: Date.now(),
          },
        ]);
        setActiveChatTopic(parsed.projectName);
        
        // Map restored tasks
        const plannedTasks: SwarmTask[] = [];
        if (parsed.completedTasks) {
          parsed.completedTasks.forEach((taskName: string, idx: number) => {
            plannedTasks.push({
              id: `task_${idx}`,
              agentRole: resolveAgentRoleFromDescription(taskName),
              description: `Restored milestone: ${taskName}`,
              priority: "Medium",
              status: "Completed",
            });
          });
        }
        setTasks(plannedTasks);
        localStorage.removeItem("chainmind_resume_context");
        addNotification("Project memory context restored successfully!", "success");
      } catch (err) {
        console.error("Failed to restore cached context:", err);
      }
    }
  }, []);

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/history`);
        const json = await res.json();
        if (json.success) {
          setConversationHistory(json.data);
        }
      } catch (err) {
        console.warn("Could not load conversation history:", err);
      }
    };
    loadHistory();
  }, []);

  // Load a specific past conversation
  const loadConversation = async (convId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${convId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const conv = json.data;
        setContext(conv.context);
        setLogs(conv.logs || []);
        setActiveChatTopic(conv.projectName);
        addNotification(`Loaded conversation: ${conv.projectName}`, "success");
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Reset swarm states
    setIsOrchestrating(true);
    setLogs([]);
    setTasks([]);
    setContext(null);
    setCurrentStep("Planning");
    setActiveChatTopic(inputText.length > 30 ? inputText.substring(0, 27) + "..." : inputText);

    const userPrompt = inputText;
    setInputText("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userPrompt, ownerWallet: walletAddress || "" }),
      });

      if (!response.ok) {
        throw new Error(`Orchestration endpoint returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream is not supported by backend response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep partial line

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          if (cleanLine.startsWith("data: ")) {
            const dataStr = cleanLine.substring(6);
            if (dataStr === "[DONE]") {
              setIsOrchestrating(false);
              addNotification("Swarm execution finalized successfully!", "success");
              break;
            }

            try {
              const logData = JSON.parse(dataStr);
              
              // Handle update from orchestrator
              if (logData.step) {
                setCurrentStep(logData.step);
                
                // Append log event
                setLogs((prev) => [
                  ...prev,
                  {
                    step: logData.step,
                    agentRole: logData.agentRole,
                    status: logData.status,
                    message: logData.message,
                    timestamp: logData.timestamp || Date.now(),
                  },
                ]);

                // Update shared context
                if (logData.context) {
                  const updatedCtx = logData.context as SharedContext;
                  setContext(updatedCtx);
                  
                  // Extract tasks list if manager created it
                  if (logData.step === "Planning" && logData.status === "completed") {
                    // Try to map default tasks structure
                    const plannedTasks: SwarmTask[] = [];
                    if (updatedCtx.pendingTasks) {
                      updatedCtx.pendingTasks.forEach((desc, idx) => {
                        plannedTasks.push({
                          id: `task_${idx}`,
                          agentRole: resolveAgentRoleFromDescription(desc),
                          description: desc,
                          priority: "Medium",
                          status: "Pending",
                        });
                      });
                    }
                    setTasks(plannedTasks);
                  }
                }
              }
            } catch (err) {
              console.error("Failed to parse SSE line data:", err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("SSE stream error:", err);
      setIsOrchestrating(false);
      setCurrentStep("Error");
      setLogs((prev) => [
        ...prev,
        {
          step: "System",
          status: "failed",
          message: `Swarm crash: ${err.message || "Failed to communicate with back-end orchestrator gateway."}`,
          timestamp: Date.now(),
        },
      ]);
      addNotification(`Swarm Execution failed: ${err.message}`, "error");
    }
  };

  const resolveAgentRoleFromDescription = (desc: string): any => {
    const d = desc.toLowerCase();
    if (d.includes("research") || d.includes("audit")) return "Research";
    if (d.includes("code") || d.includes("developer") || d.includes("smart contract")) return "Developer";
    if (d.includes("ui") || d.includes("design") || d.includes("style")) return "UI Designer";
    if (d.includes("doc") || d.includes("document") || d.includes("readme")) return "Documentation";
    if (d.includes("verify") || d.includes("security") || d.includes("check")) return "Verifier";
    return "Research";
  };

  const getAgentIcon = (role: string) => {
    switch (role) {
      case "Manager":
        return Sparkles;
      case "Research":
        return BookOpen;
      case "Developer":
        return Code;
      case "UI Designer":
        return Layout;
      case "Documentation":
        return FileText;
      case "Verifier":
        return ShieldCheck;
      default:
        return Cpu;
    }
  };

  const getAgentColor = (role: string) => {
    switch (role) {
      case "Manager":
        return "text-indigo-400 border-indigo-500/20 bg-indigo-950/20";
      case "Research":
        return "text-sky-400 border-sky-500/20 bg-sky-950/20";
      case "Developer":
        return "text-emerald-400 border-emerald-500/20 bg-emerald-950/20";
      case "UI Designer":
        return "text-pink-400 border-pink-500/20 bg-pink-950/20";
      case "Documentation":
        return "text-cyan-400 border-cyan-500/20 bg-cyan-950/20";
      case "Verifier":
        return "text-amber-400 border-amber-500/20 bg-amber-950/20";
      default:
        return "text-zinc-500 border-white/[0.04] bg-white/[0.04]";
    }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-14rem)] gap-6 overflow-hidden">
        {/* Left Sidebar - Timeline and Tasks */}
        <div className="hidden lg:flex flex-col w-80 shrink-0 glass-card p-4 overflow-y-auto">
          <div className="flex items-center gap-2 px-2 pb-4 mb-4 border-b border-white/[0.04]">
            <Layers className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Swarm Engine Graph</h3>
          </div>

          {/* Execution Steps Timeline */}
          {logs.length > 0 && (
            <div className="mb-6">
              <span className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Live Timeline</span>
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.04]">
                {logs.map((log, idx) => {
                  const Icon = getAgentIcon(log.step);
                  const isLast = idx === logs.length - 1;
                  return (
                    <div key={idx} className="flex gap-3 relative items-start">
                      <div className={`h-6.5 w-6.5 shrink-0 rounded-full flex items-center justify-center border text-[10px] ${
                        log.status === "completed" 
                          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" 
                          : log.status === "failed" 
                            ? "bg-red-950/40 border-red-500/30 text-red-400" 
                            : "bg-indigo-950/40 border-indigo-500/30 text-indigo-400 animate-pulse"
                      }`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white block truncate">{log.step}</span>
                          <span className="text-[9px] text-zinc-600 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{log.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Static Active Tasks List */}
          {tasks.length > 0 ? (
            <div>
              <span className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Task Graph Sequence</span>
              <div className="space-y-2">
                {tasks.map((task) => {
                  const isCurrent = currentStep === task.agentRole;
                  const isCompleted = context?.completedTasks.some(t => t.toLowerCase().includes(task.agentRole.toLowerCase())) || false;
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border text-xs font-semibold transition-all ${
                        isCurrent
                          ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300 shadow shadow-indigo-500/10"
                          : isCompleted
                            ? "bg-emerald-950/10 border-emerald-500/10 text-emerald-400/80"
                            : "bg-white/[0.04] border-transparent text-zinc-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-wider">{task.agentRole}</span>
                        {isCurrent && <Loader2 className="h-3 w-3 text-indigo-400 animate-spin" />}
                        {isCompleted && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                      </div>
                      <span className="block leading-relaxed font-normal">{task.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-white/[0.04] rounded-xl bg-white/[0.02]">
              <Cpu className="h-8 w-8 text-zinc-700 mb-2 animate-pulse" />
              <span className="text-xs text-zinc-600 font-bold">No active task plan</span>
              <span className="text-[10px] text-zinc-700 max-w-[180px] mt-1">Submit an instruction to draft an agent collaboration plan.</span>
            </div>
          )}
        </div>

        {/* Middle - Swarm Stream */}
        <div className="flex flex-col flex-1 glass-card overflow-hidden">
          {/* Active project header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.04] bg-gray-950/40">
            <div>
              <span className="text-sm font-bold text-white block">{activeChatTopic}</span>
              <span className="block text-[10px] text-zinc-600 font-mono">
                Session: {isOrchestrating ? "Active Swarm Pipeline" : "Idle Operator Intake"}
              </span>
            </div>
            {isOrchestrating ? (
              <span className="text-xs px-2.5 py-1 rounded bg-indigo-950/50 border border-indigo-500/20 text-indigo-400 font-semibold flex items-center gap-1.5 animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                Swarm Engine Executing...
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-500 font-semibold">
                Standby Mode
              </span>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-bold text-white">Dynamic Multi-Agent Swarm</h2>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                  Submit any system request. The Manager Agent will analyze the prompt, select necessary agents from the Monad identity registry, and coordinate executions using Shared Memory Context.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-6 w-full text-left">
                  {[
                    "Build NFT Marketplace",
                    "Design custom UI styles",
                    "Write documentation",
                    "Explain Monad consensus",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(preset)}
                      className="p-3 border border-white/[0.04] rounded-xl bg-white/[0.02] text-xs font-semibold text-zinc-400 hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all flex items-center justify-between"
                    >
                      <span>{preset}</span>
                      <ChevronRight className="h-3 w-3 text-zinc-600" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {logs
                  .filter((l) => l.status === "completed" || l.status === "failed")
                  .map((log, idx) => {
                    const Icon = getAgentIcon(log.step);
                    const colorClass = getAgentColor(log.step);
                    return (
                      <div
                        key={idx}
                        className={`flex gap-4 p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${colorClass}`}
                      >
                        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white">{log.step} Agent</span>
                            <span className="text-[9px] font-mono bg-white/[0.04] px-2 py-0.5 rounded-full uppercase tracking-widest text-zinc-500">
                              SWARM COMPONENT
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400 leading-relaxed font-medium mt-1">
                            {log.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                {/* Pulsing Active Agent Indicator */}
                {isOrchestrating && (
                  <div className="flex gap-4 p-5 rounded-2xl border bg-indigo-950/20 border-indigo-500/20 max-w-lg animate-pulse">
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-indigo-400">
                      {React.createElement(getAgentIcon(currentStep), { className: "h-5 w-5" })}
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-xs text-zinc-400 font-bold mb-1">
                        {currentStep} Agent is executing...
                      </span>
                      <div className="flex gap-1.5 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce delay-100"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={streamEndRef} />
          </div>

          {/* Bottom - Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/[0.04] bg-gray-950/40 flex items-center gap-3">
            <input
              type="text"
              placeholder="Provide instructions to the swarm..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isOrchestrating}
              className="flex-1 px-4 py-3 text-sm border border-white/[0.04] rounded-lg bg-white/[0.04] focus:outline-none focus:border-indigo-500/40 text-gray-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isOrchestrating || !inputText.trim()}
              className="p-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
            >
              {isOrchestrating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* Right Sidebar - Knowledge Base Artifact Inspector */}
        <div className="hidden xl:flex flex-col w-96 shrink-0 glass-card p-4 overflow-y-auto">
          <div className="flex items-center gap-2 px-2 pb-4 mb-4 border-b border-white/[0.04]">
            <Database className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Project Knowledge Base</h3>
          </div>

          {context ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="mb-4">
                <span className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Project Name</span>
                <span className="text-xs font-bold text-white block">{context.projectName}</span>
              </div>

              {/* Artifacts Tabs Selector */}
              <div className="flex border-b border-white/[0.04] mb-4 text-xs font-bold">
                {[
                  { id: "research", label: "research.json", data: context.researchOutput },
                  { id: "implementation", label: "implementation.json", data: context.developerOutput },
                  { id: "ui", label: "ui-design.json", data: context.uiOutput },
                  { id: "documentation", label: "documentation.json", data: context.documentation },
                  { id: "verification", label: "verification.json", data: context.verificationOutput }
                ]
                  .filter((t) => t.data)
                  .map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedArtifactTab(tab.id)}
                      className={`flex-1 pb-2 border-b-2 transition-all ${
                        selectedArtifactTab === tab.id
                          ? "border-indigo-500 text-indigo-400"
                          : "border-transparent text-zinc-600 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
              </div>

              {/* Artifact Content Area */}
              <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-gray-950 border border-white/[0.04] text-zinc-400 text-xs">
                {/* Research Output View */}
                {selectedArtifactTab === "research" && context.researchOutput && (
                  <div className="space-y-4">
                    <div className="p-3 bg-white/[0.04] border border-white/[0.04] rounded-lg">
                      <span className="font-bold text-white block mb-1">Architecture Pattern</span>
                      <span className="text-indigo-400 font-mono font-semibold">
                        {context.researchOutput.architecture?.pattern || "Modular Controller"}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-white block mb-2">Recommended Components</span>
                      <div className="flex flex-wrap gap-2">
                        {context.researchOutput.architecture?.components?.map((c: string) => (
                          <span key={c} className="px-2 py-1 rounded bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-white block mb-2">Libraries Requested</span>
                      <div className="flex flex-wrap gap-2">
                        {context.researchOutput.libraries?.map((lib: string) => (
                          <span key={lib} className="px-2 py-1 rounded bg-purple-950/40 border border-purple-500/20 text-purple-300 font-mono text-[10px]">
                            {lib}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-white block mb-2">Research Recommendations</span>
                      <ul className="list-disc pl-4 space-y-1.5 text-zinc-500">
                        {context.researchOutput.recommendations?.map((r: string, idx: number) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Developer Implementation View (File/Code Explorer) */}
                {selectedArtifactTab === "implementation" && context.developerOutput && (
                  <div className="space-y-4">
                    <div className="p-3 bg-white/[0.04] border border-white/[0.04] rounded-lg font-mono text-[11px] text-zinc-500 leading-relaxed">
                      {context.developerOutput.implementationSummary || "No implementation summary provided."}
                    </div>

                    {context.developerOutput.generatedModules && context.developerOutput.generatedModules.length > 0 ? (
                      <div>
                        <span className="font-bold text-white block mb-2">Generated Modules</span>
                        
                        {/* File Tabs */}
                        <div className="flex flex-wrap gap-1.5 mb-3 border-b border-white/[0.04] pb-2">
                          {context.developerOutput.generatedModules.map((m: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedModuleIdx(idx)}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                                selectedModuleIdx === idx
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white/[0.04] text-zinc-500 hover:bg-white/10"
                              }`}
                            >
                              {m.moduleName}.sol
                            </button>
                          ))}
                        </div>

                        {/* Code Block Container */}
                        <div className="p-3 rounded bg-black/90 border border-white/[0.04] font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-72">
                          <pre>{context.developerOutput.generatedModules[selectedModuleIdx]?.code || ""}</pre>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-mono block mt-1.5">
                          Path: {context.developerOutput.generatedModules[selectedModuleIdx]?.filePath || ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600">No generated modules.</span>
                    )}
                  </div>
                )}

                {/* UI Designer Styles View */}
                {selectedArtifactTab === "ui" && context.uiOutput && (
                  <div className="space-y-4">
                    <div className="p-3 bg-white/[0.04] border border-white/[0.04] rounded-lg">
                      <span className="font-bold text-white block mb-1">Theme Architecture</span>
                      <span className="text-pink-400 font-mono font-semibold">
                        {context.uiOutput.stylingSystem?.framework || "Glassmorphism system"}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-white block mb-3">HSL Color Swatches</span>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(context.uiOutput.stylingSystem?.palette || {}).map(([key, val]: any) => (
                          <div key={key} className="flex items-center gap-2 p-2 bg-white/[0.04] border border-white/[0.04] rounded">
                            <div className="h-6 w-6 rounded border border-white/[0.06]" style={{ backgroundColor: val }} />
                            <div>
                              <span className="block text-[10px] font-bold text-white uppercase">{key}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{val}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-white block mb-2">Typography & Components</span>
                      <ul className="list-disc pl-4 space-y-1 text-zinc-500 text-[11px]">
                        <li>Heading Font: {context.uiOutput.stylingSystem?.typography?.headingFont || "Inter"}</li>
                        <li>Body Font: {context.uiOutput.stylingSystem?.typography?.bodyFont || "Outfit"}</li>
                        <li>Layout System: {context.uiOutput.stylingSystem?.layout?.grid || "Responsive Flexbox"}</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Documentation Readme View */}
                {selectedArtifactTab === "documentation" && context.documentation && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-3">
                      <span className="font-bold text-white">README.md</span>
                      <span className="text-[10px] text-zinc-600 uppercase font-mono">COMPILED MARKDOWN</span>
                    </div>
                    <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-lg font-sans text-xs text-zinc-400 space-y-3 leading-relaxed">
                      <h2 className="text-sm font-bold text-white pb-1 border-b border-white/[0.04]">
                        {context.documentation.projectName || "Swarm Output Documentation"}
                      </h2>
                      <p className="font-mono text-[11px] bg-white/[0.04] p-2.5 rounded border border-white/[0.04] text-indigo-300">
                        {context.documentation.installationInstructions || "Run npm run dev to bootstrap."}
                      </p>
                      <div className="space-y-1.5 pt-2">
                        <span className="font-bold text-white block">Modules API Specifications:</span>
                        <ul className="list-disc pl-4 space-y-1 text-zinc-500">
                          {context.documentation.apiReference?.map((api: string, idx: number) => (
                            <li key={idx} className="font-mono text-[10px]">{api}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Court Trial Audit View */}
                {selectedArtifactTab === "verification" && context.verificationOutput && (
                  <div className="space-y-5">
                    {/* Ring Gauges Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/[0.04] p-3 rounded-lg border border-white/[0.04] text-center">
                        <span className="text-[9px] text-zinc-600 block mb-1">Consensus</span>
                        <span className={`text-sm font-bold block ${
                          context.verificationOutput.approved ? "text-emerald-400" : "text-rose-400"
                        }`}>
                          {context.verificationOutput.consensusScore || 75}%
                        </span>
                      </div>
                      <div className="bg-white/[0.04] p-3 rounded-lg border border-white/[0.04] text-center">
                        <span className="text-[9px] text-zinc-600 block mb-1">Integrity</span>
                        <span className="text-sm font-bold text-indigo-400 block">
                          {context.verificationOutput.integrityScore || 90}%
                        </span>
                      </div>
                      <div className="bg-white/[0.04] p-3 rounded-lg border border-white/[0.04] text-center">
                        <span className="text-[9px] text-zinc-600 block mb-1">Confidence</span>
                        <span className="text-sm font-bold text-purple-400 block">
                          {context.verificationOutput.confidenceScore || 85}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.04] border border-white/[0.04] rounded-lg flex items-center justify-between">
                      <span className="text-zinc-500">Consensus Ruling</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        context.verificationOutput.approved 
                          ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-950/40 border-rose-500/20 text-rose-400"
                      }`}>
                        {context.verificationOutput.approved ? "Approved & Anchored" : "Failed / Violations"}
                      </span>
                    </div>

                    {/* Violations Checklists */}
                    {context.verificationOutput.issues && context.verificationOutput.issues.length > 0 ? (
                      <div>
                        <span className="font-bold text-white block mb-2">Violations / Issues Detected</span>
                        <div className="space-y-1.5">
                          {context.verificationOutput.issues.map((issue: string, idx: number) => (
                            <div key={idx} className="p-2.5 rounded bg-rose-950/20 border border-rose-500/25 text-[11px] text-rose-300 flex items-start gap-2">
                              <span className="shrink-0 text-xs">⚠️</span>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-400 flex items-center gap-2">
                        <span>✔</span>
                        <span>All courtroom validations passed. Integrity verified.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* History logs summary */}
              <div className="mt-4 border-t border-white/[0.04] pt-4">
                <span className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  Agent Execution History
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {context.agentHistory.map((hist, idx) => (
                    <div key={idx} className="p-2 border border-white/[0.04] rounded bg-white/[0.01] text-[10px]">
                      <div className="flex justify-between font-bold text-white mb-0.5">
                        <span>{hist.agentName}</span>
                        <span className="text-indigo-400">{hist.role}</span>
                      </div>
                      <span className="text-zinc-500">{hist.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-white/[0.01] rounded-xl border border-white/[0.04]">
              <Database className="h-10 w-10 text-zinc-700 mb-2 animate-pulse" />
              <span className="text-xs font-bold text-zinc-600">Knowledge Base Empty</span>
              <p className="text-[10px] text-zinc-700 max-w-[200px] mt-1 leading-relaxed">
                As the swarm finishes tasks, their compiled structural output documents will be visible here.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
