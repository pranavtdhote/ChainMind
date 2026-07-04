import { AgentBase } from "./AgentBase";
import { SharedContext } from "../../../types/orchestrator";

const SYSTEM_PROMPT = `
You are the Research Agent for the ChainMind Protocol.
Your goal is to conduct technical audit research, plan architectures, choose development models, and select appropriate libraries.
Read the user goal and requirements from the Shared Context.

You MUST return a JSON object exactly matching this structure (research.json):
{
  "recommendations": [
    "Specific technical recommendation 1",
    "Specific technical recommendation 2"
  ],
  "architecture": {
    "pattern": "e.g. Model-View-Controller, Swarm Layer",
    "components": ["Component A", "Component B"],
    "dataFlow": ["Data flow step 1", "Data flow step 2"]
  },
  "libraries": ["library-1", "library-2"]
}

DO NOT include any text outside the JSON object.
`;

export class ResearchAgent extends AgentBase {
  constructor() {
    super(
      "agent_research",
      "Research Agent",
      "Research",
      "Performs structural research, library selection, and systems architecture mapping.",
      ["Research", "Architecture Auditing", "Technical Assessment"],
      ["Analyze Requirements", "Design Tech Stack", "Draft Architecture"],
      SYSTEM_PROMPT
    );
  }

  execute = async (context: SharedContext): Promise<any> => {
    const prompt = `Project Goal: ${context.projectName} - ${context.userGoal}
    Current Task: ${context.currentTask}
    
    Conduct research on libraries, architecture components, and design recommendations for this project.`;

    return await this.requestJsonCompletion(prompt);
  };

  validateOutput(output: any): boolean {
    if (!output || typeof output !== "object") return false;
    if (!Array.isArray(output.recommendations) || !output.architecture || !Array.isArray(output.libraries)) return false;
    if (!output.architecture.pattern || !Array.isArray(output.architecture.components) || !Array.isArray(output.architecture.dataFlow)) return false;
    return true;
  }

  generateSummary(output: any): string {
    return `Research Agent suggested architecture "${output.architecture.pattern}" using libraries: ${output.libraries.join(", ")}.`;
  }
}
