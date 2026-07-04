import { Request, Response } from "express";
import { AnalyticsService } from "../services/AnalyticsService";

export class AnalyticsController {
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await AnalyticsService.getAnalytics();
      res.status(200).json({
        success: true,
        data: {
          totalProjects: stats.transactionCount,
          activeSwarms: stats.registeredAgents,
          avgConsensus: stats.avgConsensus,
          memoryUsageMB: stats.totalMemories * 128,
          // Extended stats
          gasPriceGwei: stats.gasPriceGwei,
          latencyMs: stats.latencyMs,
          latestBlock: stats.latestBlock,
          registeredAgents: stats.registeredAgents,
          totalTasks: stats.totalTasks,
          totalMemories: stats.totalMemories,
          totalVerifications: stats.totalVerifications,
          transactionCount: stats.transactionCount
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
