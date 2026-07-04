import { monadService } from "./monad.service";

export interface IAgentProfile {
  id?: string;
  walletAddress: string;
  name: string;
  role: string;
  metadataURI: string;
  reputationScore: number;
  isActive: boolean;
  txHash?: string;
  gasUsed?: string;
}

export interface IAgentService {
  registerAgent(
    profile: Omit<IAgentProfile, "reputationScore" | "isActive"> & {
      description: string;
      capabilities: string[];
      avatar: string;
    }
  ): Promise<IAgentProfile>;
  getAgentByAddress(walletAddress: string): Promise<IAgentOnChainProfile | null>;
  listAgents(): Promise<IAgentOnChainProfile[]>;
  getActiveAgents(): Promise<IAgentProfile[]>;
  syncReputationScore(walletAddress: string): Promise<number>;
}

export interface IAgentOnChainProfile extends IAgentProfile {
  description: string;
  capabilities: string[];
  avatar: string;
  trustScore: number;
  completedTasks: number;
  verificationCount: number;
  memoryCount: number;
  status: string;
  currentProject: string;
  availability: boolean;
  verificationStatus: string;
  achievements: string[];
  badges: string[];
}

export class AgentService implements IAgentService {
  /**
   * Register a new agent profile on-chain.
   */
  registerAgent = async (
    profile: Omit<IAgentProfile, "reputationScore" | "isActive"> & {
      description: string;
      capabilities: string[];
      avatar: string;
    }
  ): Promise<IAgentProfile> => {
    try {
      const receipt = await monadService.registerAgentOnChain(
        profile.name,
        profile.role,
        profile.description,
        profile.capabilities,
        profile.avatar
      );

      console.log("Agent registered on-chain with receipt:", receipt);

      return {
        id: profile.walletAddress,
        walletAddress: profile.walletAddress,
        name: profile.name,
        role: profile.role,
        metadataURI: profile.metadataURI,
        reputationScore: 100,
        isActive: true,
        txHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      console.error("Failed to register agent on-chain:", error);
      throw error;
    }
  };

  /**
   * Fetch agent profile from on-chain.
   */
  getAgentByAddress = async (walletAddress: string): Promise<IAgentOnChainProfile | null> => {
    try {
      const raw = await monadService.callContractView("AgentRegistry", "getAgent", [walletAddress]);
      if (!raw || raw[0] === "0x0000000000000000000000000000000000000000") {
        return null;
      }

      return {
        id: raw[0],
        walletAddress: raw[0],
        name: raw[1],
        role: raw[2],
        description: raw[3],
        capabilities: raw[4] ? Array.from(raw[4]) : [],
        avatar: raw[5],
        trustScore: Number(raw[6]),
        reputationScore: Number(raw[7]),
        completedTasks: Number(raw[8]),
        verificationCount: Number(raw[9]),
        memoryCount: Number(raw[10]),
        status: raw[11],
        currentProject: raw[12],
        availability: !!raw[13],
        verificationStatus: raw[14],
        achievements: raw[15] ? Array.from(raw[15]) : [],
        badges: raw[16] ? Array.from(raw[16]) : [],
        isActive: true,
        metadataURI: "",
      };
    } catch (error) {
      console.error(`Failed to query agent profile for ${walletAddress}:`, error);
      return null;
    }
  };

  /**
   * List all registered agents.
   */
  listAgents = async (): Promise<IAgentOnChainProfile[]> => {
    try {
      const addresses: string[] = await monadService.callContractView("AgentRegistry", "getAllAgents", []);
      const profiles = await Promise.all(
        addresses.map((addr) => this.getAgentByAddress(addr).catch(() => null))
      );
      return profiles.filter((p): p is IAgentOnChainProfile => p !== null);
    } catch (error) {
      console.error("Failed to list all agents on-chain:", error);
      return [];
    }
  };

  /**
   * List active agents.
   */
  getActiveAgents = async (): Promise<IAgentProfile[]> => {
    return await this.listAgents();
  };

  /**
   * Trigger a sync on-chain reputation score.
   */
  syncReputationScore = async (walletAddress: string): Promise<number> => {
    const profile = await this.getAgentByAddress(walletAddress);
    return profile ? profile.reputationScore : 100;
  };
}

export const agentService = new AgentService();
