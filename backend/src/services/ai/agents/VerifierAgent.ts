import { AgentBase } from "./AgentBase";
import { SharedContext } from "../../../types/orchestrator";

const SYSTEM_PROMPT = `
You are the Verifier Agent for the ChainMind Protocol.
Your goal is to inspect the completed modules, check for security bugs or logical gaps, and assign an integrity score.
Review the Shared Context, especially the developer output code, before assigning scores.

You MUST return a JSON object exactly matching this structure (verification.json):
{
  "integrityScore": 85, // Integer out of 100 representing safety/correctness
  "confidence": 90, // Integer out of 100 representing certainty
  "issues": [
    "Security or design issue 1 (leave array empty if none found)",
    "Security or design issue 2"
  ],
  "approved": true // Boolean flag approval status
}

DO NOT include any text outside the JSON object.
`;

export class VerifierAgent extends AgentBase {
  constructor() {
    super(
      "agent_verifier",
      "Verifier Agent",
      "Verifier",
      "Performs code verification check loops, validation checks, and security audits.",
      ["Verification Checks", "Solidity Auditing", "Logical verification"],
      ["Verify Contract Code", "Evaluate System Security", "Approve Swarm Output"],
      SYSTEM_PROMPT
    );
  }

  execute = async (context: SharedContext): Promise<any> => {
    const devCode = context.developerOutput
      ? JSON.stringify(context.developerOutput.generatedModules)
      : "No development code written.";

    const prompt = `Project Goal: ${context.userGoal}
    Developer Output Modules:
    ${devCode}
    
    Audit this code and configuration. Review security and assign integrity scores.`;

    return await this.requestJsonCompletion(prompt);
  };

  validateOutput(output: any): boolean {
    if (!output || typeof output !== "object") return false;
    if (typeof output.integrityScore !== "number" || typeof output.confidence !== "number" || !Array.isArray(output.issues) || typeof output.approved !== "boolean") return false;
    return true;
  }

  generateSummary(output: any): string {
    return `Verifier Agent evaluated code: Integrity: ${output.integrityScore}%, Confidence: ${output.confidence}%, Approved: ${output.approved}. Issues found: ${output.issues.length}`;
  }
}
