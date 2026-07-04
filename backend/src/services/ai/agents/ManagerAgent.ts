import { AgentBase } from "./AgentBase";
import { SharedContext } from "../../../types/orchestrator";

const SYSTEM_PROMPT = `
You are the Manager Agent for the ChainMind Protocol.
Your goal is to coordinate a swarm of specialized AI agents to fulfill a user request.
You must analyze the user prompt, break it down into a list of structured subtasks, and select the appropriate agents in the correct execution sequence.

Available Agents in Swarm:
- Research: Conducts literature audits, architecture planning, and library selections.
- Developer: Code modules generator, API builders, smart contracts implementation.
- UI Designer: Interface details, component layout, and theme colors specifications.
- Documentation: Generates technical files, installation guidelines, and setup READMEs.
- Verifier: Assesses security, confidence thresholds, and test code checks.

You MUST return a JSON object exactly matching this structure:
{
  "projectName": "Name of the project",
  "goal": "Summary of the user goal",
  "tasks": [
    {
      "id": "task_1",
      "agentRole": "Research" | "Developer" | "UI Designer" | "Documentation" | "Verifier",
      "description": "Specific, actionable task description for this agent",
      "priority": "High" | "Medium" | "Low",
      "status": "Pending"
    }
  ]
}

DO NOT include any text outside the JSON object.
`;

export class ManagerAgent extends AgentBase {
  constructor() {
    super(
      "agent_manager",
      "Manager Agent",
      "Manager",
      "Orchestrates task analysis, intent slice breakdown, and agent workflow mapping.",
      ["Intake", "Workflow Planning", "Task Delegation"],
      ["Analyze User Request", "Create Task Graph"],
      SYSTEM_PROMPT
    );
  }

  execute = async (context: SharedContext): Promise<any> => {
    const prompt = `User Request: "${context.userGoal}"
    
    Plan the orchestration flow. Create a step-by-step task sequence containing only required agents. Do not include unnecessary agents. For example, if no UI is requested, do not run UI Designer. If only documentation is requested, only run Research and Documentation.`;

    return await this.requestJsonCompletion(prompt);
  };

  validateOutput(output: any): boolean {
    if (!output || typeof output !== "object") return false;
    if (!output.projectName || !output.goal || !Array.isArray(output.tasks)) return false;
    for (const task of output.tasks) {
      if (!task.id || !task.agentRole || !task.description || !task.priority) {
        return false;
      }
    }
    return true;
  }

  generateSummary(output: any): string {
    const roles = output.tasks.map((t: any) => t.agentRole).join(" -> ");
    return `Manager planned project "${output.projectName}" with execution flow: ${roles}`;
  }
}
