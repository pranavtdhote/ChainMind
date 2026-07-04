import { AgentBase } from "./agents/AgentBase";
import { ManagerAgent } from "./agents/ManagerAgent";
import { ResearchAgent } from "./agents/ResearchAgent";
import { DeveloperAgent } from "./agents/DeveloperAgent";
import { UIDesignerAgent } from "./agents/UIDesignerAgent";
import { DocumentationAgent } from "./agents/DocumentationAgent";
import { VerifierAgent } from "./agents/VerifierAgent";

export interface RegistryAgentEntry {
  agent: AgentBase;
  status: "Online" | "Busy" | "Offline";
  currentTask: string | null;
  averageCompletionTime: string; // e.g. "1.2s"
  supportedDomains: string[];
}

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agentsMap: Map<string, RegistryAgentEntry> = new Map();

  private constructor() {
    this.initializeRegistry();
  }

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private initializeRegistry() {
    this.register(new ManagerAgent(), "1.5s", ["Intake", "Planning", "Delegation"]);
    this.register(new ResearchAgent(), "3.2s", ["Architecture", "Audit", "Libraries"]);
    this.register(new DeveloperAgent(), "4.5s", ["Solidity", "TypeScript", "Express"]);
    this.register(new UIDesignerAgent(), "2.8s", ["UX", "CSS Layout", "HSL Palette"]);
    this.register(new DocumentationAgent(), "2.1s", ["Markdown", "Setup API", "Guidelines"]);
    this.register(new VerifierAgent(), "3.0s", ["Auditing", "Logic Check", "Security"]);
  }

  private register(agent: AgentBase, averageTime: string, domains: string[]) {
    this.agentsMap.set(agent.role, {
      agent,
      status: "Online",
      currentTask: null,
      averageCompletionTime: averageTime,
      supportedDomains: domains,
    });
  }

  getAgentByRole(role: string): RegistryAgentEntry | undefined {
    return this.agentsMap.get(role);
  }

  setAgentStatus(role: string, status: "Online" | "Busy" | "Offline", currentTask: string | null = null) {
    const entry = this.agentsMap.get(role);
    if (entry) {
      entry.status = status;
      entry.currentTask = currentTask;
    }
  }

  getAllAgents(): RegistryAgentEntry[] {
    return Array.from(this.agentsMap.values());
  }
}
