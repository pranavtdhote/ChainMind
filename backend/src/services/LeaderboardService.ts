import { AgentRegistryService, OnChainAgent } from "./AgentRegistryService";
import { BlockchainService } from "./BlockchainService";
import { ContractService } from "./ContractService";

export interface ILeaderboardEntry {
  rank: number;
  walletAddress: string;
  name: string;
  role: string;
  avatar: string;
  xp: number;
  level: number;
  title: string;
  reputation: number;
  completedTasks: number;
  verificationCount: number;
  memoryCount: number;
  achievements: string[];
}

export class LeaderboardService {
  private static getRegistryService(): AgentRegistryService {
    const blockchainService = new BlockchainService();
    const contractService = new ContractService(blockchainService);
    return new AgentRegistryService(contractService);
  }

  static calculateXP(tasks: number, verifications: number, memories: number): number {
    const baseXP = (tasks * 10) + (verifications * 5) + (memories * 5);
    return Math.max(0, baseXP);
  }

  static getLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 10)) + 1;
  }

  static getTitle(level: number): string {
    if (level >= 7) return "Monad Pioneer";
    if (level >= 5) return "Monad Specialist";
    if (level >= 3) return "Monad Explorer";
    return "Monad Novice";
  }

  static async getLeaderboard(): Promise<ILeaderboardEntry[]> {
    try {
      const registryService = this.getRegistryService();
      const agents = await registryService.getAllRegisteredAgents();
      
      const entries: ILeaderboardEntry[] = agents.map((agent: OnChainAgent) => {
        const tasks = Number(agent.completedTasks || 0);
        const verifications = Number(agent.verificationCount || 0);
        const memories = Number(agent.memoryCount || 0);
        
        const xp = this.calculateXP(tasks, verifications, memories);
        const level = this.getLevel(xp);
        const title = this.getTitle(level);

        return {
          rank: 0,
          walletAddress: agent.wallet,
          name: agent.name,
          role: agent.role,
          avatar: agent.avatar,
          xp,
          level,
          title,
          reputation: Number(agent.reputation || 100),
          completedTasks: tasks,
          verificationCount: verifications,
          memoryCount: memories,
          achievements: [],
        };
      });

      entries.sort((a, b) => b.xp - a.xp);

      entries.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      return entries;
    } catch (error) {
      console.error("[LeaderboardService]: Error generating leaderboard:", error);
      return [];
    }
  }
}
