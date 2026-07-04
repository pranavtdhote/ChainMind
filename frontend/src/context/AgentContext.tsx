"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { IAgentOnChainProfile, IAgentProfile, agentService } from "../services/agent.service";
import { useNotifications } from "./NotificationContext";
import { isEthereumAvailable } from "../constants/network";
import { CONTRACT_ADDRESSES } from "../constants/constants";
import { AGENT_REGISTRY_ABI } from "../services/monad.service";
import { MONAD_TESTNET } from "../constants/chain";

interface AgentContextType {
  agents: IAgentOnChainProfile[];
  selectedAgent: IAgentOnChainProfile | null;
  isLoading: boolean;
  selectAgent: (agent: IAgentOnChainProfile | null) => void;
  registerAgentOnChain: (
    name: string,
    role: string,
    description: string,
    capabilities: string[],
    avatar: string
  ) => Promise<IAgentProfile>;
  fetchAgents: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications();
  const [agents, setAgents] = useState<IAgentOnChainProfile[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<IAgentOnChainProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Method to fetch registered agents
  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await agentService.listAgents();
      
      const mocks: IAgentOnChainProfile[] = [
        {
          id: "mock1",
          walletAddress: "0x1111111111111111111111111111111111111111",
          name: "Architect Agent (Mock)",
          role: "System Designer",
          description: "Orchestrates multi-agent swarm flows and system specifications.",
          capabilities: ["UML Design", "Architecture mapping", "API design"],
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=architect",
          reputationScore: 100,
          completedTasks: 12,
          verificationCount: 3,
          memoryCount: 45,
          status: "Online",
          isActive: true,
          metadataURI: "",
          trustScore: 98,
          currentProject: "Cross-Chain Liquidity Vaults",
          availability: true,
          verificationStatus: "Verified",
          achievements: ["First Swarm", "Top Integrity"],
          badges: ["Architect Gold", "Consensus Knight"]
        },
        {
          id: "mock2",
          walletAddress: "0x2222222222222222222222222222222222222222",
          name: "Coder Agent (Mock)",
          role: "Developer",
          description: "Generates secure and compilable Smart Contracts and Rest APIs.",
          capabilities: ["Solidity", "TypeScript", "Next.js", "Express"],
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=coder",
          reputationScore: 100,
          completedTasks: 8,
          verificationCount: 2,
          memoryCount: 30,
          status: "Online",
          isActive: true,
          metadataURI: "",
          trustScore: 95,
          currentProject: "Cross-Chain Liquidity Vaults",
          availability: true,
          verificationStatus: "Verified",
          achievements: ["Secure Architect", "Solidity Champ"],
          badges: ["Contract Master", "Monad Pioneer"]
        },
      ];

      let localAgents: IAgentOnChainProfile[] = [];
      try {
        const localData = localStorage.getItem("chainmind_local_agents");
        if (localData) {
          localAgents = JSON.parse(localData);
        }
      } catch (e) {
        console.error("Failed to parse local agents:", e);
      }

      const combined = [...data, ...localAgents, ...mocks];
      
      const seen = new Set<string>();
      const uniqueAgents = combined.filter(agent => {
        const addr = agent.walletAddress.toLowerCase();
        if (seen.has(addr)) return false;
        seen.add(addr);
        return true;
      });

      setAgents(uniqueAgents);
    } catch (error) {
      console.error("Failed to load on-chain agent profiles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set selected agent
  const selectAgent = (agent: IAgentOnChainProfile | null) => {
    setSelectedAgent(agent);
  };

  // Register agent on-chain
  const registerAgentOnChain = async (
    name: string,
    role: string,
    description: string,
    capabilities: string[],
    avatar: string
  ): Promise<IAgentProfile> => {
    if (!isEthereumAvailable()) {
      addNotification("MetaMask is not available", "error");
      throw new Error("MetaMask is not available");
    }
    const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
    if (accounts.length === 0) {
      addNotification("Please connect your wallet first", "error");
      throw new Error("Please connect your wallet first");
    }

    try {
      addNotification("Sending registration transaction to Monad Testnet...", "info");
      const profile = await agentService.registerAgent({
        name,
        role,
        description,
        capabilities,
        avatar,
        walletAddress: accounts[0],
        metadataURI: "",
      });

      const newLocalAgent: IAgentOnChainProfile = {
        id: accounts[0],
        walletAddress: accounts[0],
        name,
        role,
        description,
        capabilities,
        avatar,
        reputationScore: 100,
        completedTasks: 0,
        verificationCount: 0,
        memoryCount: 0,
        status: "Online",
        isActive: true,
        metadataURI: "",
        trustScore: 100,
        currentProject: "None",
        availability: true,
        verificationStatus: "Verified",
        achievements: ["Monad Pioneer"],
        badges: ["Pioneer Bronze"]
      };

      try {
        const existingLocal = localStorage.getItem("chainmind_local_agents");
        const list = existingLocal ? JSON.parse(existingLocal) : [];
        const filtered = list.filter((a: any) => a.walletAddress.toLowerCase() !== accounts[0].toLowerCase());
        filtered.push(newLocalAgent);
        localStorage.setItem("chainmind_local_agents", JSON.stringify(filtered));
      } catch (e) {
        console.error("Failed to save local agent profile:", e);
      }

      addNotification("Agent registered successfully! Refreshing ledger...", "success");
      await fetchAgents();
      return profile;
    } catch (error: any) {
      console.error("Registration failed:", error);
      addNotification(error.message || "Registration transaction rejected.", "error");
      throw error;
    }
  };

  // Load initial list and poll for updates periodically (avoiding eth_newFilter RPC limitations)
  useEffect(() => {
    fetchAgents();
    const interval = setInterval(() => {
      fetchAgents();
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, [fetchAgents]);

  return (
    <AgentContext.Provider
      value={{
        agents,
        selectedAgent,
        isLoading,
        selectAgent,
        registerAgentOnChain,
        fetchAgents,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgents must be used within an AgentProvider");
  }
  return context;
};
