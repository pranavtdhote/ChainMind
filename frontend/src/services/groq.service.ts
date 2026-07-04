export interface IGroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface IGroqResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface IGroqService {
  /**
   * Send a chat session to Groq's high-speed inference endpoints.
   */
  chatCompletion(messages: IGroqMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<IGroqResponse>;

  /**
   * Evaluate a task output with a jury prompt for AgentCourt consensus.
   * Returns a structured decision report.
   */
  evaluateOutput(taskContext: string, outputToVerify: string): Promise<{ confidenceScore: number; approved: boolean; reasoning: string }>;

  /**
   * Summarize collaboration chat transcripts into memory block representations.
   */
  summarizeCollaboration(messages: IGroqMessage[]): Promise<string>;
}
