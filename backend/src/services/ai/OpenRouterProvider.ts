import { IModelProvider } from "./IModelProvider";

export class OpenRouterProvider implements IModelProvider {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = "meta-llama/llama-3-8b-instruct:free") {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  generate = async (
    prompt: string,
    systemPrompt?: string,
    options?: { jsonMode?: boolean; temperature?: number }
  ): Promise<string> => {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key not configured.");
    }

    try {
      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://chainmind.protocol",
          "X-Title": "ChainMind Protocol",
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          temperature: options?.temperature ?? 0.2,
          response_format: options?.jsonMode ? { type: "json_object" } : undefined,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API returned error status ${response.status}: ${errText}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenRouter provider request failed:", error);
      throw error;
    }
  };

  health = async (): Promise<boolean> => {
    try {
      if (!this.apiKey) return false;
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { "Authorization": `Bearer ${this.apiKey}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  models = async (): Promise<string[]> => {
    return [
      "meta-llama/llama-3-8b-instruct:free",
      "qwen/qwen-2.5-72b-instruct",
      "deepseek/deepseek-chat",
      "google/gemma-2-9b-it",
    ];
  };
}
