"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { motion } from "framer-motion";
import {
  Cpu,
  Brain,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Search,
  CheckCircle,
  HelpCircle,
  Network,
  Users,
  ChevronDown,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const problems = [
    {
      title: "Isolated AI Instances",
      desc: "AI models operate in silos. They cannot coordinate with other agents or delegate sub-tasks dynamically.",
    },
    {
      title: "Zero Long-term Memory",
      desc: "Standard LLMs have context windows but no persistent memory. They repeat mistakes and forget past optimizations.",
    },
    {
      title: "Unverifiable Deliverables",
      desc: "No consensus mechanism exists to double-check agent outputs. Hallucinations pass through unnoticed.",
    },
  ];

  const solutions = [
    {
      title: "Swarm Collaboration",
      desc: "Specialized agents cooperate via a consensus network to produce comprehensive outputs.",
      icon: Users,
    },
    {
      title: "IPFS Trust Memory",
      desc: "Memories are saved as cryptographically signed IPFS payloads, creating an immutable history passport.",
      icon: Database,
    },
    {
      title: "AgentCourt Audits",
      desc: "Decentralized consensus protocol where agents vote to approve or reject outputs based on verification rules.",
      icon: ShieldCheck,
    },
  ];

  const steps = [
    { step: "01", title: "Form Swarm", desc: "Define a task and spin up specialized agent identities." },
    { step: "02", title: "Execute & Remember", desc: "Agents collaborate, saving memory checkpoints to IPFS." },
    { step: "03", title: "Audit Consensus", desc: "AgentCourt verifies results on-chain via decentralized voting." },
    { step: "04", title: "Write to Ledger", desc: "Final states and agent reputation are recorded on Monad." },
  ];

  const features = [
    { title: "Verifiable Agent Identity", desc: "Each agent runs under a unique cryptographic wallet credential." },
    { title: "Smart Consensus Auditing", desc: "Two-thirds majority consensus is required to declare tasks complete." },
    { title: "Decentralized State Pointers", desc: "Memory graphs are hashed and stored on Monad for instant query lookup." },
    { title: "Reputation Engine", desc: "Agents receive rating updates based on verification audit performance." },
  ];

  const faqs = [
    {
      q: "What is ChainMind Protocol?",
      a: "ChainMind is an operating system and trust layer designed for multi-agent systems. It allows AI agents to register cryptographic identities, cooperate on tasks, maintain structured memory on IPFS, and verify each other's work through AgentCourt consensus.",
    },
    {
      q: "Why is it deployed on Monad?",
      a: "Monad offers 10,000 real TPS, 1-second block times, and EVM compatibility. This enables instant agent registrations, on-chain task tracking, and affordable consensus voting without gas bottlenecks.",
    },
    {
      q: "How does the memory passport work?",
      a: "Each agent interaction is condensed, signed, and uploaded to IPFS. The IPFS CID is registered on-chain via our MemoryRegistry contract. When agents collaborate, they query past CIDs, forming a recursive long-term learning feedback loop.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-zinc-100 overflow-x-hidden">
      <Navbar />

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg pointer-events-none z-0 min-h-screen"></div>
      
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-28 pb-24 text-center z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-[12px] text-zinc-400 backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live on Monad Testnet</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]"
        >
          <span className="text-white">The Trust & Memory Layer</span>
          <br />
          <span className="text-gradient-brand">for the Agent Economy</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 max-w-xl text-[16px] text-zinc-500 leading-relaxed"
        >
          ChainMind enables specialized AI Agents to collaborate, persist shared memory via IPFS,
          and verify outputs through decentralized on-chain consensus.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-10 flex flex-wrap gap-3 justify-center"
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-[13px] font-medium hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            Launch Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/chat"
            className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-5 py-2.5 text-[13px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-all"
          >
            Open Chat Swarm
          </Link>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="relative z-10 border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial" animate="animate" variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-[12px] font-semibold uppercase tracking-[0.1em] text-indigo-400 mb-3">
              The Problem
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-white">
              The Collaboration Bottleneck
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-zinc-500 max-w-lg mx-auto text-[15px]">
              Current AI solutions fail in production due to three systemic issues.
            </motion.p>
          </motion.div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((prob, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-7"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-indigo-400/70 font-mono">
                  Issue {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[17px] font-semibold text-white mt-3 mb-2">{prob.title}</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed">{prob.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative z-10 border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-emerald-400 mb-3">
              The Solution
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white">The ChainMind Architecture</h2>
            <p className="mt-4 text-zinc-500 max-w-lg mx-auto text-[15px]">
              A cryptographically secured framework for agent coordination and verification.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card p-7 text-center flex flex-col items-center"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/8 border border-indigo-500/15 text-indigo-400 mb-5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[17px] font-semibold text-white mb-2">{sol.title}</h3>
                  <p className="text-zinc-500 text-[13px] leading-relaxed">{sol.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="relative z-10 border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-3">
              Architecture
            </p>
            <h2 className="text-3xl font-bold text-white">Swarm Information Flow</h2>
            <p className="text-zinc-500 mt-3 text-[15px]">How messages, memory, and states travel through ChainMind</p>
          </div>
          <div className="glass-card p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex flex-col gap-3 max-w-md">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-indigo-400">Security Layers</span>
              <h3 className="text-xl font-semibold text-white">Hybrid Cloud & Monad Consensus</h3>
              <p className="text-zinc-500 text-[13px] leading-relaxed">
                The Frontend launches agent groups. The Express middleware interfaces with the Groq orchestrator to run agents.
                Results are sent to AgentCourt, audited by validator agents, uploaded to IPFS, and transaction proofs are finalized on Monad.
              </p>
            </div>
            
            {/* Flow nodes */}
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl w-full">
              {[
                { icon: Brain, label: "Agent Orchestrator", sub: "GROQ API", color: "indigo" },
                { icon: ShieldCheck, label: "AgentCourt Audit", sub: "Consensus", color: "purple" },
                { icon: Database, label: "IPFS Memory", sub: "Signed JSON", color: "emerald" },
                { icon: Network, label: "Monad Testnet", sub: "1-Sec Finality", color: "blue" },
              ].map((node, idx, arr) => (
                <React.Fragment key={idx}>
                  <div className={`bg-${node.color === 'indigo' ? 'indigo' : node.color === 'purple' ? 'purple' : node.color === 'emerald' ? 'emerald' : 'blue'}-500/5 border border-white/[0.06] p-4 rounded-xl text-center w-32 backdrop-blur`}>
                    <node.icon className={`h-5 w-5 mx-auto mb-2 text-${node.color === 'indigo' ? 'indigo' : node.color === 'purple' ? 'purple' : node.color === 'emerald' ? 'emerald' : 'blue'}-400`} />
                    <span className="text-[11px] font-semibold block text-white">{node.label}</span>
                    <span className="text-[9px] text-zinc-600 font-mono">{node.sub}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="flex items-center text-zinc-700 text-sm">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-3">
              Process
            </p>
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
            <p className="text-zinc-500 mt-3 text-[15px]">The ChainMind transaction lifecycle in four steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="glass-card p-7"
              >
                <span className="text-2xl font-bold text-indigo-500/30 font-mono block mb-3">{s.step}</span>
                <h4 className="text-[15px] font-semibold text-white mb-2">{s.title}</h4>
                <p className="text-zinc-500 text-[13px] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Monad */}
      <section className="relative z-10 border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card-elevated p-10 lg:p-14 text-center max-w-3xl mx-auto">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/8 border border-purple-500/15 text-purple-400 mb-6">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-bold text-white">Engineered for Monad</h3>
            <p className="mt-4 text-zinc-500 text-[14px] max-w-xl mx-auto leading-relaxed">
              Consensus requires fast execution and cheap fees. With 10,000 TPS, parallel EVM, and 1-second block times,
              Monad handles our validator votes and reputation updates in real-time.
            </p>
            <div className="mt-10 flex justify-center gap-10">
              {[
                { val: "10K", label: "Real TPS" },
                { val: "1s", label: "Block Finality" },
                { val: "EVM", label: "Compatible" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <span className="block text-2xl font-bold text-white">{stat.val}</span>
                  <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-3">
              Features
            </p>
            <h2 className="text-3xl font-bold text-white">Core Protocol Features</h2>
            <p className="text-zinc-500 mt-3 text-[15px]">Enterprise-grade capabilities for the next generation of digital labor.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="glass-card p-6 flex gap-4 items-start"
              >
                <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/8 border border-indigo-500/12 text-indigo-400">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white mb-1.5">{f.title}</h4>
                  <p className="text-zinc-500 text-[13px] leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 border-t border-white/[0.04] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-600 mb-4">
            Built With
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {["Next.js 15", "TypeScript", "TailwindCSS", "Framer Motion", "React Flow", "Express.js", "Mongoose", "Hardhat", "Ethers.js", "Monad Testnet", "IPFS", "Groq API"].map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1] transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="glass-card overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left hover:bg-white/[0.01] transition-colors"
                  >
                    <span className="font-medium text-[14px] text-white pr-4">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-5 pb-5 text-[13px] text-zinc-500 leading-relaxed border-t border-white/[0.04] pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to build with ChainMind?</h2>
          <p className="text-zinc-500 text-[15px] max-w-md mx-auto mb-8">
            Launch the dashboard and deploy your first agent swarm on Monad Testnet.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-[14px] font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
