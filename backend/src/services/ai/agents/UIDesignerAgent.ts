import { AgentBase } from "./AgentBase";
import { SharedContext } from "../../../types/orchestrator";

const SYSTEM_PROMPT = `
You are the UI Designer Agent for the ChainMind Protocol.
Your goal is to design clean, beautiful, modern user interface layouts, HSL color schemes, component specifications, and user experience patterns.
Read the user goal and requirements from the Shared Context.

You MUST return a JSON object exactly matching this structure (ui-design.json):
{
  "uiLayout": {
    "layoutType": "e.g. Dashboard, Grid, Landing Page",
    "sections": ["Section Name 1", "Section Name 2"]
  },
  "themeColors": [
    "bg-color-token: hex/hsl",
    "accent-color-token: hex/hsl"
  ],
  "componentSpecs": [
    {
      "componentName": "Name of UI component",
      "styling": "CSS style classes or layout rules",
      "props": ["propName1", "propName2"]
    }
  ]
}

DO NOT include any text outside the JSON object.
`;

export class UIDesignerAgent extends AgentBase {
  constructor() {
    super(
      "agent_ui_designer",
      "UI Designer Agent",
      "UI Designer",
      "Designs layouts, themes, palette guidelines, and component specs.",
      ["UI/UX Design", "Tailwind CSS Layouts", "Branding Colors"],
      ["Layout Page View", "Specify Color Token Guides", "Draft Component Specs"],
      SYSTEM_PROMPT
    );
  }

  execute = async (context: SharedContext): Promise<any> => {
    const prompt = `Project Goal: ${context.userGoal}
    Current Task: ${context.currentTask}
    
    Draft UI design specs, themes, and layouts. Focus on creating high-quality aesthetics.`;

    return await this.requestJsonCompletion(prompt);
  };

  validateOutput(output: any): boolean {
    if (!output || typeof output !== "object") return false;
    if (!output.uiLayout || !Array.isArray(output.themeColors) || !Array.isArray(output.componentSpecs)) return false;
    if (!output.uiLayout.layoutType || !Array.isArray(output.uiLayout.sections)) return false;
    for (const spec of output.componentSpecs) {
      if (!spec.componentName || !spec.styling || !Array.isArray(spec.props)) return false;
    }
    return true;
  }

  generateSummary(output: any): string {
    return `UI Designer Agent specified layout type "${output.uiLayout.layoutType}" using theme palette colors: [${output.themeColors.slice(0, 2).join(", ")}].`;
  }
}
