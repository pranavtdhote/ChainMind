import { IModelProvider } from "./IModelProvider";
import { GroqProvider } from "./GroqProvider";
import { OpenRouterProvider } from "./OpenRouterProvider";
import { OllamaProvider } from "./OllamaProvider";
import { MockProvider } from "./MockProvider";
import { ModelConfig } from "../../types/orchestrator";

export class ModelProviderFactory {
  /**
   * Instantiates a model provider based on configuration.
   * Falls back to MockProvider if credentials or configurations are invalid.
   */
  static getProvider(config: ModelConfig): IModelProvider {
    switch (config.provider) {
      case "groq":
        if (!config.apiKey || config.apiKey.includes("your_key_here") || config.apiKey.trim() === "") {
          console.warn("[ModelProviderFactory]: Groq API Key missing. Falling back to MockProvider.");
          return new MockProvider();
        }
        return new GroqProvider(config.apiKey, config.model);
        
      case "openrouter":
        if (!config.apiKey || config.apiKey.trim() === "") {
          console.warn("[ModelProviderFactory]: OpenRouter API Key missing. Falling back to MockProvider.");
          return new MockProvider();
        }
        return new OpenRouterProvider(config.apiKey, config.model);
        
      case "ollama":
        return new OllamaProvider(config.baseUrl || "http://127.0.0.1:11434", config.model);
        
      case "mock":
      default:
        return new MockProvider();
    }
  }

  /**
   * Returns a configured provider by checking active environment variables.
   */
  static getProviderFromEnv(agentRole: string): IModelProvider {
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const ollamaUrl = process.env.OLLAMA_BASE_URL;

    // Default model assignments by role (Phase 3 requirements)
    let provider: "groq" | "openrouter" | "ollama" | "mock" = "mock";
    let model = "mock-gpt";

    if (groqKey && !groqKey.includes("your_key_here") && groqKey.trim() !== "") {
      provider = "groq";
      switch (agentRole) {
        case "Manager":
          model = "llama-3.1-8b-instant"; // High capacity for planning
          break;
        case "Developer":
          model = "llama-3.1-8b-instant"; // Fast context for coding
          break;
        case "Verifier":
          model = "llama-3.1-8b-instant"; // Rigid validation logic
          break;
        case "Research":
        default:
          model = "llama-3.1-8b-instant";
          break;
      }
    } else if (openrouterKey && openrouterKey.trim() !== "") {
      provider = "openrouter";
      switch (agentRole) {
        case "Manager":
          model = "qwen/qwen-2.5-72b-instruct";
          break;
        case "Developer":
          model = "deepseek/deepseek-chat";
          break;
        case "Verifier":
          model = "google/gemma-2-9b-it";
          break;
        case "Research":
        default:
          model = "meta-llama/llama-3-8b-instruct:free";
          break;
      }
    } else if (ollamaUrl) {
      provider = "ollama";
      model = "llama3";
    }

    const config: ModelConfig = {
      provider,
      model,
    };

    const activeKey = provider === "groq" ? groqKey : openrouterKey;
    if (activeKey) {
      config.apiKey = activeKey;
    }
    if (ollamaUrl) {
      config.baseUrl = ollamaUrl;
    }

    return this.getProvider(config);
  }
}
