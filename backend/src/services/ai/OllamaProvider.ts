import { IModelProvider } from "./IModelProvider";

export class OllamaProvider implements IModelProvider {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl = "http://127.0.0.1:11434", defaultModel = "llama3") {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultModel = defaultModel;
  }

  generate = async (
    prompt: string,
    systemPrompt?: string,
    options?: { jsonMode?: boolean; temperature?: number }
  ): Promise<string> => {
    try {
      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
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
        throw new Error(`Ollama returned error status ${response.status}: ${errText}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("Ollama provider request failed:", error);
      throw error;
    }
  };

  health = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  };

  models = async (): Promise<string[]> => {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (!res.ok) return [this.defaultModel];
      const data: any = await res.json();
      return data.models?.map((m: any) => m.name) || [this.defaultModel];
    } catch {
      return [this.defaultModel];
    }
  };
}
