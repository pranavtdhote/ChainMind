import { AgentBase } from "./AgentBase";
import { SharedContext } from "../../../types/orchestrator";

const SYSTEM_PROMPT = `
You are the Documentation Agent for the ChainMind Protocol.
Your goal is to write user setup guides, API documents, and installation markdown sheets.
Review the Shared Context, especially the developer output, to create correct documentation.

You MUST return a JSON object exactly matching this structure (documentation.json):
{
  "apiDocs": "Detailed markdown explanation of files or API structures",
  "installationSteps": [
    "Step 1 installation instructions",
    "Step 2 configuration settings"
  ]
}

DO NOT include any text outside the JSON object.
`;

export class DocumentationAgent extends AgentBase {
  constructor() {
    super(
      "agent_documentation",
      "Documentation Agent",
      "Documentation",
      "Drafts API documentation pages, installation guides, and setup guidelines.",
      ["Markdown writing", "API Mapping Documentation", "System setup manuals"],
      ["Generate API Docs", "Write Project Setup README"],
      SYSTEM_PROMPT
    );
  }

  execute = async (context: SharedContext): Promise<any> => {
    const devSummary = context.developerOutput
      ? context.developerOutput.implementationSummary
      : "No modules compiled yet.";

    const prompt = `Project Goal: ${context.userGoal}
    Developer Modules: ${devSummary}
    
    Create comprehensive technical documentation and setup steps.`;

    return await this.requestJsonCompletion(prompt);
  };

  validateOutput(output: any): boolean {
    if (!output || typeof output !== "object") return false;
    if (!output.apiDocs || !Array.isArray(output.installationSteps)) return false;
    return true;
  }

  generateSummary(output: any): string {
    return `Documentation Agent created API documentation (${output.apiDocs.substring(0, 40)}...) with ${output.installationSteps.length} install steps.`;
  }
}
