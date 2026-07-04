export interface ISystemMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  totalMemories: number;
  monadTxCount: number;
  averageConsensusScore: number;
}

export interface IAnalyticsService {
  /**
   * Fetch aggregate system metrics for the dashboard.
   */
  getSystemMetrics(): Promise<ISystemMetrics>;

  /**
   * Fetch task completion volume trends over time.
   */
  getTaskTrends(period: "day" | "week" | "month"): Promise<{ date: string; value: number }[]>;

  /**
   * Fetch memory creation rates.
   */
  getMemoryGrowth(): Promise<{ date: string; count: number }[]>;

  /**
   * Fetch agent-specific efficiency scores (task count, accuracy, consensus).
   */
  getAgentLeaderboard(): Promise<{ agentAddress: string; name: string; tasksCompleted: number; score: number }[]>;
}
