export interface IModelProvider {
  /**
   * Generates a text completion from the provider.
   * @param prompt User prompt context.
   * @param systemPrompt System level guidance.
   * @param options Additional generation parameters (e.g. temperature, jsonMode).
   */
  generate(prompt: string, systemPrompt?: string, options?: { jsonMode?: boolean; temperature?: number }): Promise<string>;
  
  /**
   * Health check for network or server connection.
   */
  health(): Promise<boolean>;

  /**
   * Returns list of supported/available models on the provider.
   */
  models(): Promise<string[]>;
}
