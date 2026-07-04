export interface SubTask {
  id: string;
  agentRole: "Manager" | "Research" | "Developer" | "UI Designer" | "Documentation" | "Verifier";
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Running" | "Completed" | "Failed";
}

export interface TaskGraph {
  projectName: string;
  goal: string;
  tasks: SubTask[];
}

export interface AgentHistoryEntry {
  agentId: string;
  agentName: string;
  role: string;
  action: string;
  timestamp: number;
}

export interface ResearchArtifact {
  recommendations: string[];
  architecture: {
    pattern: string;
    components: string[];
    dataFlow: string[];
  };
  libraries: string[];
}

export interface DeveloperArtifact {
  implementationSummary: string;
  generatedModules: Array<{
    moduleName: string;
    filePath: string;
    code: string;
  }>;
}

export interface UIArtifact {
  uiLayout: {
    layoutType: string;
    sections: string[];
  };
  themeColors: string[];
  componentSpecs: Array<{
    componentName: string;
    styling: string;
    props: string[];
  }>;
}

export interface DocumentationArtifact {
  apiDocs: string;
  installationSteps: string[];
}

export interface VerificationArtifact {
  integrityScore: number;
  confidence: number;
  issues: string[];
  approved: boolean;
}

export interface SharedContext {
  projectName: string;
  userGoal: string;
  requirements: string[];
  currentTask: string;
  completedTasks: string[];
  pendingTasks: string[];
  
  // Knowledge Base Artifacts
  researchOutput?: ResearchArtifact;
  developerOutput?: DeveloperArtifact;
  uiOutput?: UIArtifact;
  documentation?: any; // Allow flexible structure for docs
  verificationOutput?: VerificationArtifact;
  courtReport?: any; // AI Courtroom report details
  feedbackInstructions?: string; // Feedback loop details

  // Audit Logs
  agentHistory: AgentHistoryEntry[];
  currentStatus: string;
  timestamp: number;
  contextVersion: number;
}

export interface ModelConfig {
  provider: "groq" | "openrouter" | "ollama" | "mock";
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface AgentOrchestrationLog {
  step: string;
  agentId?: string;
  agentRole?: string;
  status: "started" | "completed" | "failed" | "info";
  message: string;
  timestamp: number;
  context?: Partial<SharedContext>;
}
