import { IModelProvider } from "./IModelProvider";

export class GroqProvider implements IModelProvider {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = "llama-3.1-70b-versatile") {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  generate = async (
    prompt: string,
    systemPrompt?: string,
    options?: { jsonMode?: boolean; temperature?: number }
  ): Promise<string> => {
    if (!this.apiKey || this.apiKey.includes("your_key_here")) {
      throw new Error("Groq API key not configured.");
    }

    try {
      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
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
        throw new Error(`Groq API returned error status ${response.status}: ${errText}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("Groq provider request failed:", error);
      throw error;
    }
  };

  health = async (): Promise<boolean> => {
    try {
      if (!this.apiKey || this.apiKey.includes("your_key_here")) return false;
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { "Authorization": `Bearer ${this.apiKey}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  models = async (): Promise<string[]> => {
    return [
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ];
  };
}
