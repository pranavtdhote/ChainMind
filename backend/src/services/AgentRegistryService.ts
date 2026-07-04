import { ContractService } from "./ContractService";
import { ethers } from "ethers";

export interface OnChainAgent {
  wallet: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  avatar: string;
  trustScore: number;
  reputation: number;
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

export class AgentRegistryService {
  private contractService: ContractService;

  constructor(contractService: ContractService) {
    this.contractService = contractService;
  }

  /**
   * Fetch single agent profile on-chain.
   */
  getAgentProfile = async (address: string): Promise<OnChainAgent> => {
    try {
      const contract = this.contractService.getAgentRegistryContract() as any;
      const rawAgent = await contract.getAgent(address);

      return {
        wallet: rawAgent[0],
        name: rawAgent[1],
        role: rawAgent[2],
        description: rawAgent[3],
        capabilities: rawAgent[4] ? Array.from(rawAgent[4]) : [],
        avatar: rawAgent[5],
        trustScore: Number(rawAgent[6]),
        reputation: Number(rawAgent[7]),
        completedTasks: Number(rawAgent[8]),
        verificationCount: Number(rawAgent[9]),
        memoryCount: Number(rawAgent[10]),
        status: rawAgent[11],
        currentProject: rawAgent[12],
        availability: !!rawAgent[13],
        verificationStatus: rawAgent[14],
        achievements: rawAgent[15] ? Array.from(rawAgent[15]) : [],
        badges: rawAgent[16] ? Array.from(rawAgent[16]) : [],
      };
    } catch (error) {
      console.error(`Failed to fetch on-chain agent ${address}:`, error);
      throw error;
    }
  };

  /**
   * Fetch all registered agent addresses.
   */
  getAllRegisteredAddresses = async (): Promise<string[]> => {
    try {
      const contract = this.contractService.getAgentRegistryContract() as any;
      return await contract.getAllAgents();
    } catch (error) {
      console.error("Failed to query registered agent addresses list:", error);
      throw error;
    }
  };

  /**
   * Fetch list of all registered agents with profile.
   */
  getAllRegisteredAgents = async (): Promise<OnChainAgent[]> => {
    try {
      const addresses = await this.getAllRegisteredAddresses();
      const profiles = await Promise.all(
        addresses.map((address) => this.getAgentProfile(address).catch(() => null))
      );
      return profiles.filter((p): p is OnChainAgent => p !== null);
    } catch (error) {
      console.error("Failed to query profiles for all agents:", error);
      throw error;
    }
  };
}
