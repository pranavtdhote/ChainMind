import { ManagerAgent } from "./agents/ManagerAgent";
import { SharedContext, TaskGraph } from "../../types/orchestrator";

export class TaskPlanner {
  private managerAgent: ManagerAgent;

  constructor() {
    this.managerAgent = new ManagerAgent();
  }

  /**
   * Generates a structured Task Graph from a user goal.
   * @param userGoal Prompt requested by the user.
   */
  async planTask(userGoal: string): Promise<TaskGraph> {
    const initialContext: SharedContext = {
      projectName: "Pending Intake",
      userGoal,
      requirements: [],
      currentTask: "Orchestration Planning",
      completedTasks: [],
      pendingTasks: [],
      agentHistory: [],
      currentStatus: "Planning",
      timestamp: Date.now(),
      contextVersion: 1,
    };

    console.log(`[TaskPlanner]: Planning task graph for goal: "${userGoal}"`);
    try {
      const graph = await this.managerAgent.execute(initialContext);
      
      // Validate schema
      if (!this.managerAgent.validateOutput(graph)) {
        throw new Error("Manager returned invalid task graph schema.");
      }

      console.log(`[TaskPlanner]: Planned project "${graph.projectName}" with ${graph.tasks.length} tasks.`);
      return graph as TaskGraph;
    } catch (error: any) {
      console.error("[TaskPlanner]: Failed to plan task graph:", error.message);
      // Fail-soft: fallback to default graph slice based on userGoal keywords
      return this.generateFallbackGraph(userGoal);
    }
  }

  private generateFallbackGraph(goal: string): TaskGraph {
    const gl = goal.toLowerCase();
    const tasks: any[] = [
      { id: "task_1", agentRole: "Research", description: "Audit requirements and research dependencies", priority: "High", status: "Pending" },
    ];

    if (gl.includes("nft") || gl.includes("marketplace") || gl.includes("code") || gl.includes("develop")) {
      tasks.push({ id: "task_2", agentRole: "Developer", description: "Build code modules matching requirements", priority: "High", status: "Pending" });
    }

    if (gl.includes("ui") || gl.includes("design") || gl.includes("style")) {
      tasks.push({ id: "task_3", agentRole: "UI Designer", description: "Map custom palette styling variables", priority: "Medium", status: "Pending" });
    }

    if (gl.includes("doc") || gl.includes("document") || gl.includes("readme")) {
      tasks.push({ id: "task_4", agentRole: "Documentation", description: "Document code and system configurations", priority: "Low", status: "Pending" });
    }

    // Always append verifier
    tasks.push({ id: "task_5", agentRole: "Verifier", description: "Verify safety and logical correctness", priority: "Medium", status: "Pending" });

    return {
      projectName: "ChainMind Fallback Project",
      goal,
      tasks,
    };
  }
}
