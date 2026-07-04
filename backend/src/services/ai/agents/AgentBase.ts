import { SharedContext } from "../../../types/orchestrator";
import { IModelProvider } from "../IModelProvider";
import { ModelProviderFactory } from "../ModelProviderFactory";

export abstract class AgentBase {
  public id: string;
  public name: string;
  public role: string;
  public description: string;
  public capabilities: string[];
  public supportedTasks: string[];
  public systemPrompt: string;
  
  protected modelProvider: IModelProvider;

  constructor(
    id: string,
    name: string,
    role: string,
    description: string,
    capabilities: string[],
    supportedTasks: string[],
    systemPrompt: string
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.description = description;
    this.capabilities = capabilities;
    this.supportedTasks = supportedTasks;
    this.systemPrompt = systemPrompt;
    
    // Resolve model provider from env dynamically by role
    this.modelProvider = ModelProviderFactory.getProviderFromEnv(role);
  }

  /**
   * Execute the agent task logic.
   * @param context Shared execution state.
   */
  abstract execute(context: SharedContext): Promise<any>;

  /**
   * Check if context meets minimal execution conditions.
   */
  validateInput(context: SharedContext): boolean {
    if (!context || !context.userGoal) {
      console.warn(`[AgentBase - ${this.name}]: Input validation failed. Missing user goal.`);
      return false;
    }
    return true;
  }

  /**
   * Validate that the output format matches the schema.
   */
  abstract validateOutput(output: any): boolean;

  /**
   * Returns a human readable description of what was accomplished.
   */
  abstract generateSummary(output: any): string;

  /**
   * Helper to request JSON completions from the provider.
   */
  protected async requestJsonCompletion(prompt: string): Promise<any> {
    try {
      const response = await this.modelProvider.generate(prompt, this.systemPrompt, { jsonMode: true });
      return JSON.parse(response);
    } catch (error: any) {
      console.error(`[AgentBase - ${this.name}]: Failed to parse JSON completion:`, error.message);
      // Fallback: Attempt simple regex JSON parsing if wrapping happens
      try {
        const jsonMatch = error.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {}
      throw new Error(`LLM did not return valid JSON content: ${error.message}`);
    }
  }
}
