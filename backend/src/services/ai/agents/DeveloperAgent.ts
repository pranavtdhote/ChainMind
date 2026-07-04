import { AgentBase } from "./AgentBase";
import { SharedContext } from "../../../types/orchestrator";

const SYSTEM_PROMPT = `
You are the Developer Agent for the ChainMind Protocol.
Your goal is to write secure code modules, smart contracts, or API routers based on the user request and the research details in the Shared Context.
Review the Shared Context, especially the research output, before writing code.

You MUST return a JSON object exactly matching this structure (implementation.json):
{
  "implementationSummary": "High level overview of what modules were created",
  "generatedModules": [
    {
      "moduleName": "Name of module",
      "filePath": "Relative path for saving this code file",
      "code": "Actual compilable code contents as a string"
    }
  ]
}

DO NOT include any text outside the JSON object.
`;

export class DeveloperAgent extends AgentBase {
  constructor() {
    super(
      "agent_developer",
      "Developer Agent",
      "Developer",
      "Generates compilable modules, smart contracts, and REST API controllers.",
      ["Solidity", "TypeScript", "Express Routing", "Web3 Hooks"],
      ["Generate Smart Contracts", "Implement Backend Endpoints", "Write Unit Tests"],
      SYSTEM_PROMPT
    );
  }

  execute = async (context: SharedContext): Promise<any> => {
    const researchStr = context.researchOutput 
      ? JSON.stringify(context.researchOutput, null, 2)
      : "No research available yet.";

    let prompt = `Project Goal: ${context.userGoal}
    Research Architecture:
    ${researchStr}
    
    Implement the files or modules requested. Make sure they are typed and match the architectural layout.`;

    if (context.feedbackInstructions) {
      prompt += `\n\nFEEDBACK REVISION INSTRUCTIONS FROM AGENTCOURT:\n${context.feedbackInstructions}`;
    }

    return await this.requestJsonCompletion(prompt);
  };

  validateOutput(output: any): boolean {
    if (!output || typeof output !== "object") return false;
    if (!output.implementationSummary || !Array.isArray(output.generatedModules)) return false;
    for (const mod of output.generatedModules) {
      if (!mod.moduleName || !mod.filePath || !mod.code) return false;
    }
    return true;
  }

  generateSummary(output: any): string {
    const modulesStr = output.generatedModules.map((m: any) => m.moduleName).join(", ");
    return `Developer Agent implemented modules: [${modulesStr}].`;
  }
}
