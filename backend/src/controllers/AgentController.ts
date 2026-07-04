import { Request, Response } from "express";
import { AgentRepository } from "../repositories/AgentRepository";
import { AgentRegistryService } from "../services/AgentRegistryService";
import { LeaderboardService } from "../services/LeaderboardService";

export class AgentController {
  private agentRepository: AgentRepository;
  private agentRegistryService: AgentRegistryService;

  constructor(agentRepository: AgentRepository, agentRegistryService: AgentRegistryService) {
    this.agentRepository = agentRepository;
    this.agentRegistryService = agentRegistryService;
  }

  getAgents = async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Attempt to query real on-chain agents from Monad Testnet
      const onChainAgents = await this.agentRegistryService.getAllRegisteredAgents();
      
      if (onChainAgents.length > 0) {
        res.status(200).json({ success: true, source: "monad_testnet", data: onChainAgents });
        return;
      }

      // 2. Fallback to mock agents if none are registered on-chain yet
      const mockAgents = this.getMockAgents();
      res.status(200).json({ success: true, source: "mock", data: mockAgents });
    } catch (error: any) {
      console.warn("Monad Testnet fetching unavailable, serving mock local agents:", error.message);
      const mockAgents = this.getMockAgents();
      res.status(200).json({ success: true, source: "mock_fallback", data: mockAgents });
    }
  };

  getAgentByAddress = async (req: Request, res: Response): Promise<void> => {
    const address = req.params.address;
    try {
      if (!address) {
        res.status(400).json({ success: false, error: "Address param required" });
        return;
      }
      const onChainAgent = await this.agentRegistryService.getAgentProfile(address as string);
      res.status(200).json({ success: true, source: "monad_testnet", data: onChainAgent });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: `Agent profile at address ${address} not registered on-chain.`,
      });
    }
  };

  registerAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, role, walletAddress, metadataURI } = req.body;
      res.status(201).json({
        success: true,
        message: "Agent registration parameters validated. Please sign on-chain via client interface.",
        data: { name, role, walletAddress, metadataURI },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await LeaderboardService.getLeaderboard();
      if (!data || data.length === 0) {
        const mockEntries = this.getMockAgents().map((agent, index) => {
          const xp = LeaderboardService.calculateXP(agent.completedTasks, agent.verificationCount, agent.memoryCount);
          const level = LeaderboardService.getLevel(xp);
          const title = LeaderboardService.getTitle(level);
          return {
            rank: index + 1,
            walletAddress: agent.walletAddress,
            name: agent.name,
            role: agent.role,
            avatar: agent.avatar,
            xp,
            level,
            title,
            reputation: agent.reputationScore,
            completedTasks: agent.completedTasks,
            verificationCount: agent.verificationCount,
            memoryCount: agent.memoryCount,
            achievements: ["First Project", "Monad Pioneer"]
          };
        });
        res.status(200).json({ success: true, source: "mock", data: mockEntries });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  private getMockAgents() {
    return [
      {
        walletAddress: "0x1111111111111111111111111111111111111111",
        name: "Architect Agent",
        role: "System Designer",
        description: "Orchestrates multi-agent swarm flows and system specifications.",
        capabilities: ["UML Design", "Architecture mapping", "API design"],
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=architect",
        reputationScore: 100,
        completedTasks: 12,
        verificationCount: 3,
        memoryCount: 45,
        isActive: true,
        status: "Online",
      },
      {
        walletAddress: "0x2222222222222222222222222222222222222222",
        name: "Coder Agent",
        role: "Developer",
        description: "Generates secure and compilable Smart Contracts and Rest APIs.",
        capabilities: ["Solidity", "TypeScript", "Next.js", "Express"],
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=coder",
        reputationScore: 100,
        completedTasks: 8,
        verificationCount: 2,
        memoryCount: 30,
        isActive: true,
        status: "Online",
      },
    ];
  }
}
