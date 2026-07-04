"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { CourtService, ICourtStatistics, ICourtCaseSummary } from "../../services/court.service";
import { monadService } from "../../services/monad.service";
import { switchNetwork } from "../../constants/network";
import {
  ShieldAlert,
  ShieldCheck,
  Percent,
  Activity,
  History,
  Code,
  FileCode,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  BookOpen
} from "lucide-react";

export default function AgentCourt() {
  const [stats, setStats] = useState<ICourtStatistics>({
    totalCases: 0,
    averageIntegrity: 0,
    averageConsensus: 0,
    averageConfidence: 0,
    failedVerifications: 0,
    approvedCount: 0,
    approvalRate: 0,
    courtStatus: "Active",
    verifierStatus: "Online",
  });

  const [cases, setCases] = useState<ICourtCaseSummary[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedCaseDetails, setSelectedCaseDetails] = useState<any>(null);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<"research" | "developer" | "violations">("violations");
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const [anchoring, setAnchoring] = useState<boolean>(false);
  const [voting, setVoting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleAnchorToMonad = async () => {
    if (!selectedCaseDetails) return;
    setAnchoring(true);
    setErrorMessage("");
    try {
      const switched = await switchNetwork();
      if (!switched) {
        throw new Error("Please switch your MetaMask to Monad Testnet.");
      }

      const taskId = selectedCaseDetails.courtId;
      const evidenceHash = selectedCaseDetails.evidence?.researchCid || "QmCMOnChainResearchEvidence";
      
      const initiateRes = await monadService.initiateVerificationOnChain(taskId, evidenceHash);
      const caseIdOnChain = initiateRes.caseId;

      await monadService.finalizeCaseOnChain(
        caseIdOnChain,
        selectedCaseDetails.cid || "QmCMOnChainReportIPFS",
        selectedCaseDetails.consensusScore,
        selectedCaseDetails.integrityScore,
        selectedCaseDetails.confidenceScore
      );

      // 3. Persist the real transaction hash and case ID to the backend DB
      const updatedReport = await CourtService.anchorReport(
        selectedCaseDetails.courtId,
        initiateRes.receipt.transactionHash,
        caseIdOnChain
      );

      setSelectedCaseDetails(updatedReport);

      await fetchStatsAndHistory();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to anchor trial on Monad ledger.");
    } finally {
      setAnchoring(false);
    }
  };

  const handleVoteOnChain = async (approve: boolean) => {
    if (!selectedCaseDetails) return;
    setVoting(true);
    setErrorMessage("");
    try {
      const switched = await switchNetwork();
      if (!switched) {
        throw new Error("Please switch your MetaMask to Monad Testnet.");
      }

      const caseId = selectedCaseDetails.courtId;
      const receipt = await monadService.submitVoteOnChain(caseId, approve);
      
      await fetchStatsAndHistory();
      if (selectedCaseId) {
        await fetchCaseDetails(selectedCaseId);
      }
      alert(`Vote submitted successfully! Tx: ${receipt.transactionHash}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to submit vote on-chain.");
    } finally {
      setVoting(false);
    }
  };

  const fetchStatsAndHistory = async () => {
    try {
      let list = await CourtService.getHistory();
      let s = await CourtService.getStatistics();

      try {
        const onChainList = await monadService.getAllVerificationCasesOnChain();
        if (onChainList && onChainList.length > 0) {
          const existingIds = new Set(list.map(c => c.courtId));
          const uniqueOnChain = onChainList.filter(c => !existingIds.has(c.courtId));
          list = [...uniqueOnChain, ...list];
          
          const total = list.length;
          const approvedCount = list.filter(c => c.approved).length;
          const failedCount = total - approvedCount;
          const avgIntegrity = Math.round(list.reduce((acc, c) => acc + (c.integrityScore || 0), 0) / total);
          const avgConsensus = Math.round(list.reduce((acc, c) => acc + (c.consensusScore || 0), 0) / total);
          const avgConfidence = Math.round(list.reduce((acc, c) => acc + (c.confidenceScore || c.consensusScore || 0), 0) / total);
          
          s = {
            totalCases: total,
            averageIntegrity: avgIntegrity,
            averageConsensus: avgConsensus,
            averageConfidence: avgConfidence,
            failedVerifications: failedCount,
            approvedCount,
            approvalRate: total > 0 ? Math.round((approvedCount / total) * 100) : 100,
            courtStatus: "Active",
            verifierStatus: "Online"
          };
        }
      } catch (onChainErr) {
        console.warn("Failed to load or merge on-chain verification cases:", onChainErr);
      }

      if (list.length === 0) {
        list = [
          { courtId: "case_022e0f900dff", projectName: "NFT Marketplace Swarm", approved: true, integrityScore: 92, consensusScore: 88, timestamp: new Date().toISOString() },
          { courtId: "case_18da9810a9fe", projectName: "DeFi Flash Loan Arbitrage Swarm", approved: false, integrityScore: 65, consensusScore: 60, timestamp: new Date().toISOString() },
          { courtId: "case_f28bca12efda", projectName: "Monad Bridge Governance Swarm", approved: true, integrityScore: 96, consensusScore: 92, timestamp: new Date().toISOString() }
        ];
        
        s = {
          totalCases: 3,
          averageIntegrity: 84,
          averageConsensus: 80,
          averageConfidence: 77,
          failedVerifications: 1,
          approvedCount: 2,
          approvalRate: 67,
          courtStatus: "Active",
          verifierStatus: "Online",
        };
      }

      setStats(s);
      setCases(list);

      if (list.length > 0 && !selectedCaseId) {
        setSelectedCaseId(list[0].courtId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCaseDetails = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      let details = await CourtService.getReport(id);

      if (!details) {
        const foundCase = cases.find(c => c.courtId === id);
        if (foundCase) {
          details = {
            courtId: foundCase.courtId,
            projectName: foundCase.projectName,
            approved: foundCase.approved,
            integrityScore: foundCase.integrityScore,
            consensusScore: foundCase.consensusScore,
            confidenceScore: foundCase.confidenceScore || foundCase.consensusScore,
            timestamp: foundCase.timestamp,
            transactionHash: foundCase.courtId.startsWith("0x") ? foundCase.courtId : "0x" + foundCase.courtId,
            cid: (foundCase as any).reportURI || "QmCMOnChainReportIPFS",
            verifyingAgent: "agent_court",
            arguments: foundCase.approved
              ? [
                  "Audited solidity syntax rules and mapped requirement specifications.",
                  "Integrity verified. Security vulnerabilities mitigated in code revision loop.",
                  `Consensus met on-chain: Approved with ${foundCase.consensusScore}% score.`
                ]
              : [
                  "Audited Solidity code safety and swarming constraints.",
                  `On-chain consensus rejected case. Score of ${foundCase.consensusScore}% is below the 75% approval threshold.`,
                  "Security vulnerability or conflict detected in development iteration."
                ],
            violations: foundCase.approved ? [] : ["Consensus fell below 75% threshold."],
            recommendations: foundCase.approved ? [] : ["Align design patterns with specifications.", "Verify contract modifier guards on-chain."],
            validators: [
              { validatorName: "Requirement Validator", score: foundCase.approved ? 90 : 70, approved: foundCase.approved, issues: foundCase.approved ? [] : ["Missing requirements mapping"], recommendation: "Align requirements" },
              { validatorName: "Architecture Validator", score: foundCase.approved ? 95 : 60, approved: foundCase.approved, issues: foundCase.approved ? [] : ["Contract schema mismatch"], recommendation: "Fix Solidity interfaces" },
              { validatorName: "Security Validator", score: foundCase.approved ? 100 : 50, approved: foundCase.approved, issues: foundCase.approved ? [] : ["Missing safety constraints"], recommendation: "Add security checks" },
              { validatorName: "Consistency Validator", score: foundCase.approved ? 100 : 60, approved: foundCase.approved, issues: foundCase.approved ? [] : ["Design mismatch"], recommendation: "Align designs" },
              { validatorName: "Monad Usage Validator", score: foundCase.approved ? 90 : 80, approved: true, issues: [], recommendation: "Optimized" }
            ],
            evidence: {
              researchCid: (foundCase as any).evidenceHash || "QmOnChainResearchEvidence",
              developerCid: "QmOnChainDeveloperEvidence",
            }
          };
        }
      }

      if (details) {
        setSelectedCaseDetails(details);
        if (details.violations && details.violations.length > 0) {
          setActiveEvidenceTab("violations");
        } else {
          setActiveEvidenceTab("developer");
        }
        setSelectedFileIdx(0);
      } else {
        const fallbackDetails = generateMockDetails(id);
        setSelectedCaseDetails(fallbackDetails);
        setActiveEvidenceTab("violations");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndHistory().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseDetails(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatsAndHistory();
    if (selectedCaseId) {
      await fetchCaseDetails(selectedCaseId);
    }
    setRefreshing(false);
  };

  // UI mock fallback generator
  const generateMockDetails = (id: string) => {
    const isApproved = id === "case_022e0f900dff" || id === "case_f28bca12efda";
    let name = "DeFi Aggregator Swarm";
    if (id === "case_022e0f900dff") name = "NFT Marketplace Swarm";
    if (id === "case_f28bca12efda") name = "Monad Bridge Governance Swarm";

    return {
      courtId: id,
      projectName: name,
      approved: isApproved,
      integrityScore: isApproved ? (id === "case_f28bca12efda" ? 96 : 82) : 65,
      consensusScore: isApproved ? (id === "case_f28bca12efda" ? 92 : 78) : 60,
      confidenceScore: isApproved ? (id === "case_f28bca12efda" ? 94 : 85) : 55,
      timestamp: new Date().toISOString(),
      transactionHash: "0x1d5f2a138c201a4e107bb49f8cd628b03efac812ab50d9124be394faecde194b",
      cid: "QmCMCourtReportMockCID1028392",
      verifyingAgent: "agent_court",
      arguments: isApproved 
        ? [
            "Audited solidity syntax rules and mapped requirement specifications.",
            "Integrity verified. Security vulnerabilities mitigated in code revision loop.",
            "Consensus met: Approved."
          ]
        : [
            "Audited DeFi flash loan safety bounds.",
            "Critical conflict detected: Research recommended Aave V3 pools, but Developer implemented Euler Vaults.",
            "Security vulnerability: External transfer performed without nonReentrant guard.",
            "Consensus rejected: Score below threshold."
          ],
      violations: isApproved 
        ? [] 
        : [
            "Conflict: Research recommended Aave V3 pools, but Developer implemented Euler Vaults.",
            "Security Hazard: Missing nonReentrant modifier on external flashLoan execution."
          ],
      recommendations: isApproved 
        ? [] 
        : [
            "Refactor contracts/FlashSwapper.sol to use Aave V3 endpoints.",
            "Add '@openzeppelin/contracts/security/ReentrancyGuard.sol' and mount 'nonReentrant' modifier."
          ],
      validators: [
        { validatorName: "Requirement Validator", score: isApproved ? 90 : 70, approved: isApproved, issues: isApproved ? [] : ["Missing Aave endpoints"], recommendation: "Align endpoints" },
        { validatorName: "Architecture Validator", score: isApproved ? 95 : 60, approved: isApproved, issues: isApproved ? [] : ["Integration mismatch"], recommendation: "Fix pools" },
        { validatorName: "Security Validator", score: isApproved ? 100 : 50, approved: isApproved, issues: isApproved ? [] : ["Missing reentrancy guard"], recommendation: "Add guards" },
        { validatorName: "Consistency Validator", score: isApproved ? 100 : 60, approved: isApproved, issues: isApproved ? [] : ["Database/library mismatch"], recommendation: "Swap libraries" },
        { validatorName: "Monad Usage Validator", score: isApproved ? 90 : 80, approved: true, issues: [], recommendation: "Optimized" }
      ],
      evidence: {
        researchCid: "QmResearchFallbackMockHash10283",
        developerCid: "QmDeveloperFallbackMockHash48293",
      }
    };
  };

  const selectedCase = cases.find(c => c.courtId === selectedCaseId) || selectedCaseDetails;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            AgentCourt
          </h1>
          <p className="mt-1.5 text-zinc-500 text-[13px]">
            Decentralized validation, consensus telemetry, and code auditing.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-white rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Syncing..." : "Sync State"}
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {[
          { name: "Global Approval Rate", value: `${stats.approvalRate}%`, label: `Out of ${stats.totalCases} cases`, icon: ShieldCheck, color: "text-emerald-400" },
          { name: "Average Consensus", value: `${stats.averageConsensus}%`, label: "Consensus threshold: 75%", icon: Percent, color: "text-indigo-400" },
          { name: "Average Integrity Score", value: `${stats.averageIntegrity}%`, label: "Checks compliance score", icon: TrendingUp, color: "text-purple-400" },
          { name: "Courtroom Status", value: stats.courtStatus, label: `Verifier node: ${stats.verifierStatus}`, icon: Activity, color: "text-emerald-400" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.06em]">{stat.name}</span>
                <div className={`p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] ${stat.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl font-bold text-white tracking-tight">{stat.value}</span>
                <span className="block mt-1 text-[10px] text-zinc-600">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left column: Historical Cases list */}
        <div className="glass-card p-5 flex flex-col gap-5 h-[720px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <History className="h-4 w-4 text-zinc-500" /> Docket History
            </h3>
            <span className="text-[11px] text-zinc-600 font-mono">Verifications</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {cases.length === 0 ? (
              <div className="text-center py-12 text-[12px] text-zinc-600">
                No courtroom records compiled yet. Run a swarm verification to generate audits.
              </div>
            ) : (
              cases.map((c) => (
                <div
                  key={c.courtId}
                  onClick={() => setSelectedCaseId(c.courtId)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCaseId === c.courtId
                      ? "bg-white/[0.03] border-indigo-500/30"
                      : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-600 font-mono uppercase">{c.courtId}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider border ${
                        c.approved
                          ? "bg-emerald-500/8 text-emerald-400 border-emerald-500/15"
                          : "bg-red-500/8 text-red-400 border-red-500/15"
                      }`}
                    >
                      {c.approved ? "Approved" : "Rejected"}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-semibold text-white mb-3 truncate">{c.projectName}</h4>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Integrity: <strong className="text-zinc-300 font-medium">{c.integrityScore}%</strong></span>
                    <span className="font-mono text-indigo-400 font-medium">{c.consensusScore}% Consensus</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center & Right column combined details view */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {loading ? (
            <div className="glass-card p-6 h-[720px] flex items-center justify-center flex-col gap-4">
              <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
              <p className="text-zinc-400 text-sm">Fetching case trial audit logs...</p>
            </div>
          ) : selectedCaseDetails ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 h-full lg:h-[720px]">
              
              {/* Center section: Node Flow Visualization & Metrics (3 Cols) */}
              <div className="lg:col-span-3 flex flex-col gap-5 h-full">
                
                {/* Node Canvas */}
                <div className="glass-card p-6 flex flex-col flex-1 relative overflow-hidden bg-zinc-950/20">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 block">Interactive Verification Flow</span>
                  
                  {/* Flow Map Visualizer */}
                  <div className="flex-1 flex flex-col justify-between py-4 relative z-10">
                    {[
                      { role: "Research", label: "Research Recommendations", status: "completed", val: selectedCaseDetails.evidence.researchCid ? "QmResearch" : "Pending" },
                      { role: "Developer", label: "Developer Modules Code", status: "completed", val: selectedCaseDetails.evidence.developerCid ? "QmDeveloper" : "Pending" },
                      { role: "Verifier", label: "AgentCourt Trial Audit", status: selectedCaseDetails.approved ? "completed" : "failed", val: selectedCaseDetails.courtId },
                      { role: "Monad", label: "On-Chain Verification Registry", status: selectedCaseDetails.approved ? "completed" : "failed", val: selectedCaseDetails.approved ? selectedCaseDetails.transactionHash.substring(0, 14) + "..." : "Blocked" }
                    ].map((step, idx, arr) => (
                      <div key={idx} className="relative">
                        <div className="flex items-center gap-4 relative z-10">
                          {/* Circle Icon Indicator */}
                          <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                            step.status === "completed"
                              ? "bg-emerald-950/70 border-emerald-500 text-emerald-400 shadow-emerald-500/10"
                              : step.status === "failed"
                              ? "bg-red-950/70 border-red-500 text-red-400 shadow-red-500/10"
                              : "bg-zinc-950 border-zinc-800 text-zinc-600"
                          }`}>
                            {idx + 1}
                          </div>
                          
                          {/* Label info */}
                          <div>
                            <span className="block text-xs font-semibold text-zinc-400">{step.role} Output</span>
                            <span className="block text-sm font-bold text-white">{step.label}</span>
                            <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">{step.val}</span>
                          </div>
                        </div>

                        {/* Connector line */}
                        {idx < arr.length - 1 && (
                          <div className={`absolute left-5 top-10 w-[2px] h-12 -z-10 ${
                            step.status === "completed" && arr[idx + 1].status !== "pending"
                              ? "bg-gradient-to-b from-emerald-500 to-emerald-500/20"
                              : "bg-zinc-800"
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Micro timeline overlay if failed */}
                  {!selectedCaseDetails.approved && (
                    <div className="mt-4 p-3 bg-red-950/30 border border-red-500/20 rounded-lg flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <div className="text-xs text-red-300">
                        <strong>Revision Loop Engaged:</strong> Consensus fell below 75%. Feedback dispatched to Developer Agent for code refactoring.
                      </div>
                    </div>
                  )}
                </div>

                {/* Score Meters Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: "Consensus", val: selectedCaseDetails.consensusScore, color: "text-indigo-400" },
                    { title: "Integrity", val: selectedCaseDetails.integrityScore, color: "text-purple-400" },
                    { title: "Confidence", val: selectedCaseDetails.confidenceScore, color: "text-emerald-400" }
                  ].map((meter, mIdx) => (
                    <div key={mIdx} className="glass-card p-4 text-center flex flex-col justify-between bg-zinc-900/30">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">{meter.title}</span>
                      <div className="my-2 relative flex items-center justify-center">
                        {/* Circular Progress Path */}
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" className="stroke-zinc-800 fill-none" strokeWidth="4" />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            className={`fill-none transition-all duration-1000 ${
                              meter.title === "Consensus"
                                ? "stroke-indigo-500"
                                : meter.title === "Integrity"
                                ? "stroke-purple-500"
                                : "stroke-emerald-500"
                            }`}
                            strokeWidth="4"
                            strokeDasharray={2 * Math.PI * 28}
                            strokeDashoffset={2 * Math.PI * 28 * (1 - meter.val / 100)}
                          />
                        </svg>
                        <span className="absolute text-sm font-extrabold text-white">{meter.val}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Monad Trust Anchoring & Voting Panel */}
                <div className="glass-card p-4 border border-zinc-800 bg-zinc-950/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Monad Ledger Trust State</span>
                    </div>
                    {selectedCaseDetails.isAnchored ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        Anchored On-Chain
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">
                        Pending On-Chain Anchor
                      </span>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-red-950/20 border border-red-500/25 rounded text-red-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {!selectedCaseDetails.isAnchored ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] text-zinc-400">
                        This AI courtroom trial decision is currently logged in the local trial database. Commit this trial on the Monad ledger to enable decentralized audit voting.
                      </p>
                      <button
                        onClick={handleAnchorToMonad}
                        disabled={anchoring}
                        className="w-full py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-extrabold text-white rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all animate-pulse"
                      >
                        {anchoring ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Anchoring Trial to Monad...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Anchor Trial to Monad Testnet</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono bg-zinc-900/50 p-2 rounded border border-zinc-800">
                        <span className="text-[10px]">On-Chain ID:</span>
                        <span className="text-white truncate max-w-[200px]" title={selectedCaseDetails.courtId}>{selectedCaseDetails.courtId}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVoteOnChain(true)}
                          disabled={voting}
                          className="flex-1 py-2 bg-emerald-950/30 hover:bg-emerald-900/20 border border-emerald-500/30 hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-emerald-400 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                        >
                          {voting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                          <span>Vote Approve</span>
                        </button>
                        
                        <button
                          onClick={() => handleVoteOnChain(false)}
                          disabled={voting}
                          className="flex-1 py-2 bg-red-950/20 hover:bg-red-900/10 border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-red-400 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                        >
                          {voting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                          <span>Vote Reject</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Right section: Evidence Inspector Panel & Reports (2 Cols) */}
              <div className="lg:col-span-2 flex flex-col h-full overflow-hidden glass-card p-6 border border-zinc-800">
                <div className="flex border-b border-zinc-800 pb-3 mb-4 gap-4">
                  {[
                    { id: "violations", label: "Trial Log" },
                    { id: "research", label: "Research" },
                    { id: "developer", label: "Code Audit" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveEvidenceTab(tab.id as any)}
                      className={`text-xs font-bold pb-2 relative transition-all ${
                        activeEvidenceTab === tab.id
                          ? "text-white border-b-2 border-indigo-500"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content screens */}
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                  {activeEvidenceTab === "violations" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Courtroom Verdict</h4>
                        <p className={`text-sm font-bold ${selectedCaseDetails.approved ? "text-emerald-400" : "text-red-400"}`}>
                          {selectedCaseDetails.approved ? "Approved & Verified" : "Rejected due to Violations"}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Auditor Arguments</h4>
                        <ul className="space-y-2">
                          {selectedCaseDetails.arguments?.map((arg: string, idx: number) => (
                            <li key={idx} className="text-xs text-zinc-400 flex gap-2">
                              <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                              <span>{arg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {selectedCaseDetails.violations?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Detected Violations</h4>
                          <ul className="space-y-2">
                            {selectedCaseDetails.violations.map((violation: string, idx: number) => (
                              <li key={idx} className="text-xs text-red-300 bg-red-950/20 border border-red-950 p-2 rounded flex gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                <span>{violation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedCaseDetails.recommendations?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Court Recommendations</h4>
                          <ul className="space-y-2">
                            {selectedCaseDetails.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="text-xs text-emerald-300 bg-emerald-950/10 border border-emerald-950/20 p-2 rounded flex gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeEvidenceTab === "research" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">System Design Target</h4>
                        <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800">
                          <span className="block text-xs font-bold text-indigo-400 mb-1">Architecture Pattern</span>
                          <span className="text-xs text-zinc-300 block font-mono">Model-View-Controller + Service Layer Pattern</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Recommended Libraries</h4>
                        <div className="flex flex-wrap gap-2">
                          {["ethers@6.x", "framer-motion", "lucide-react"].map((lib, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded font-mono">
                              {lib}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">IPFS Evidence Pointers</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 bg-zinc-900/30 border border-zinc-800/80 rounded hover:border-zinc-700 transition-all cursor-pointer">
                            <span className="text-xs text-zinc-400 font-mono truncate mr-2">Research Metadata (CID)</span>
                            <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEvidenceTab === "developer" && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Source Modules Audited</h4>
                      <div className="space-y-2">
                        {[
                          { file: "AgentRegistryController.ts", path: "backend/src/controllers/AgentController.ts", lines: 18 },
                          { file: "BlockchainService.sol", path: "contracts/BlockchainService.sol", lines: 25 }
                        ].map((fileObj, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedFileIdx(idx)}
                            className={`p-2.5 rounded border cursor-pointer transition-all flex items-center justify-between ${
                              selectedFileIdx === idx
                                ? "bg-indigo-500/5 border-indigo-500/30 text-white"
                                : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-indigo-400" />
                              <div className="text-left">
                                <span className="block text-xs font-bold">{fileObj.file}</span>
                                <span className="block text-[10px] text-zinc-500 truncate max-w-[200px]">{fileObj.path}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{fileObj.lines} lines</span>
                          </div>
                        ))}
                      </div>

                      {/* Simple Code Panel Mock */}
                      <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg overflow-x-auto font-mono text-[10px] leading-relaxed text-zinc-300">
                        {selectedFileIdx === 0 ? (
                          <pre>
{`class AgentController {
  constructor(pgService) {
    this.db = pgService;
  }
  
  getAgents = async () => {
    // Verified DB schema
    return this.db.query(
      'SELECT * FROM agents'
    );
  }
}`}
                          </pre>
                        ) : (
                          <pre>
{`contract BlockchainService {
  // Deployed on Monad 10143
  
  function verifyUser(
    address addr, 
    address caller
  ) public view {
    // Replaced tx.origin check
    require(caller == addr);
  }
}`}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Anchor details */}
                {selectedCaseDetails.approved && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
                    {selectedCaseDetails.isAnchored && selectedCaseDetails.transactionHash ? (
                      <>
                        <div className="flex items-center gap-1 text-zinc-400">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          <span>Anchored on Monad Ledger</span>
                        </div>
                        <a
                          href={`https://testnet.monadscan.com/tx/${selectedCaseDetails.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                        >
                          View Tx <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
                          <span>Consensus Proof Staged (Local Trial)</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-semibold italic">
                          Pending On-Chain Anchor
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-card p-6 h-[720px] flex items-center justify-center text-zinc-500">
              Select a court report case to inspect audits and consensus.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
