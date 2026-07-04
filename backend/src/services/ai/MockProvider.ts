import { IModelProvider } from "./IModelProvider";

export class MockProvider implements IModelProvider {
  generate = async (
    prompt: string,
    systemPrompt?: string,
    options?: { jsonMode?: boolean; temperature?: number }
  ): Promise<string> => {
    const sys = (systemPrompt || "").toLowerCase();
    const usr = prompt.toLowerCase();

    // 1. Manager Agent / Task Planner Mock response
    if (sys.includes("manager agent") || sys.includes("task planner")) {
      const isNFT = usr.includes("nft") || usr.includes("marketplace");
      const isDoc = usr.includes("document") || usr.includes("doc");
      const isUI = usr.includes("ui") || usr.includes("design");

      if (isNFT) {
        return JSON.stringify({
          projectName: "NFT Marketplace Swarm",
          goal: prompt,
          tasks: [
            { id: "task_1", agentRole: "Research", description: "Audit NFT ERC-721 protocols and select state hooks", priority: "High", status: "Pending" },
            { id: "task_2", agentRole: "UI Designer", description: "Design responsive nft card and collection layout specs", priority: "Medium", status: "Pending" },
            { id: "task_3", agentRole: "Developer", description: "Write smart contracts and API router controller code", priority: "High", status: "Pending" },
            { id: "task_4", agentRole: "Verifier", description: "Verify secure code bounds and compile integrity", priority: "Medium", status: "Pending" },
          ],
        });
      }

      if (isDoc) {
        return JSON.stringify({
          projectName: "Documentation Swarm",
          goal: prompt,
          tasks: [
            { id: "task_1", agentRole: "Research", description: "Outline system setup flow and configurations", priority: "Medium", status: "Pending" },
            { id: "task_2", agentRole: "Documentation", description: "Generate comprehensive API guidelines and README docs", priority: "High", status: "Pending" },
          ],
        });
      }

      if (isUI) {
        return JSON.stringify({
          projectName: "UI Design Swarm",
          goal: prompt,
          tasks: [
            { id: "task_1", agentRole: "UI Designer", description: "Map out palette guidelines and component styling properties", priority: "High", status: "Pending" },
            { id: "task_2", agentRole: "Verifier", description: "Validate responsive viewport scaling", priority: "Medium", status: "Pending" },
          ],
        });
      }

      // Default fallback swarm tasks
      return JSON.stringify({
        projectName: "General Swarm",
        goal: prompt,
        tasks: [
          { id: "task_1", agentRole: "Research", description: "Conduct competitive audit and gather prerequisites", priority: "High", status: "Pending" },
          { id: "task_2", agentRole: "Developer", description: "Build main functional features and database model", priority: "High", status: "Pending" },
        ],
      });
    }

    // 2. Documentation Agent Mock response (Checked early to avoid Developer substring overlap)
    if (sys.includes("documentation agent") || sys.includes("technical docs")) {
      return JSON.stringify({
        apiDocs: "### GET /api/agents\nFetches registered agent swarm entries.\n\n### POST /api/chat\nInitiates collaborative orchestrator task graphs.",
        installationSteps: ["npm install", "cp .env.example .env", "npm run build", "npm run dev"],
      });
    }

    // 3. Verifier Agent Mock response (Checked early to avoid Developer substring overlap)
    if (sys.includes("verifier agent") || sys.includes("evaluation")) {
      return JSON.stringify({
        integrityScore: 98,
        confidence: 95,
        issues: [],
        approved: true,
      });
    }

    // 4. Research Agent Mock response
    if (sys.includes("research agent") || sys.includes("architecture")) {
      return JSON.stringify({
        recommendations: [
          "Use PostgreSQL database for robust relational indexing of agent identities.",
          "Use HSL color systems with tailwind-like custom style values for premium layouts.",
          "Implement ethers.js JsonRpcProvider caching to prevent node rate limits.",
        ],
        architecture: {
          pattern: "Model-View-Controller (MVC) + Service Layer Interface Pattern",
          components: ["BlockchainService", "ContractService", "AgentRegistryService", "WalletController"],
          dataFlow: ["Client -> Express POST /chat -> Orchestrator -> Smart Contracts -> Client Event Subscriptions"],
        },
        libraries: ["ethers@6.x", "framer-motion", "lucide-react"],
      });
    }

    // 5. Developer Agent Mock response
    if (sys.includes("developer agent") || sys.includes("implementation")) {
      // Check if prompt indicates feedback revisions are requested
      const hasFeedback = prompt.toLowerCase().includes("rejected") || prompt.toLowerCase().includes("violation") || prompt.toLowerCase().includes("feedback");
      
      if (hasFeedback) {
        return JSON.stringify({
          implementationSummary: "Revised developer output: Migrated database connectors to PostgreSQL schema and replaced tx.origin checks with msg.sender.",
          generatedModules: [
            {
              moduleName: "AgentRegistryController",
              filePath: "backend/src/controllers/AgentController.ts",
              code: "class AgentController { constructor(pgService) { this.db = pgService; } getAgents = async() => { return this.db.query('SELECT * FROM agents'); } }",
            },
            {
              moduleName: "BlockchainService",
              filePath: "contracts/BlockchainService.sol",
              code: "contract BlockchainService { // Deployed on Monad Testnet Chain ID 10143\n function verifyUser(address addr, address caller) public { require(caller == addr); } }",
            },
          ],
        });
      }

      // Default first-run: outputs MySQL database and tx.origin security vulnerability
      return JSON.stringify({
        implementationSummary: "Designed initial registry code using MySQL connector.",
        generatedModules: [
          {
            moduleName: "AgentRegistryController",
            filePath: "backend/src/controllers/AgentController.ts",
            code: "class AgentController { constructor(mysqlService) { this.db = mysqlService; } getAgents = async() => { return this.db.query('SELECT * FROM agents'); } }",
          },
          {
            moduleName: "BlockchainService",
            filePath: "contracts/BlockchainService.sol",
            code: "contract BlockchainService { function verifyUser(address addr) public { require(tx.origin == addr); } }",
          },
        ],
      });
    }

    // 6. UI Designer Agent Mock response
    if (sys.includes("ui designer agent") || sys.includes("interface")) {
      return JSON.stringify({
        uiLayout: {
          layoutType: "Split-pane Dashboard with Slide-out Drawer Panel",
          sections: ["Metric Counters Grid", "Agent Registry Cards", "Interactive Web3 Signer Panel", "Real-time Tx Feed"],
        },
        themeColors: ["#09090b (Bg)", "#6366f1 (Indigo Accent)", "#10b981 (Emerald success)"],
        componentSpecs: [
          {
            componentName: "AgentCard",
            styling: "glass-card p-6 border border-white/5 hover:border-indigo-500/30 transition-all",
            props: ["name", "role", "reputation", "status", "avatar"],
          },
        ],
      });
    }

    // General string completion fallback
    return `Mock completion response for query: "${prompt}".`;
  };

  health = async (): Promise<boolean> => {
    return true;
  };

  models = async (): Promise<string[]> => {
    return ["mock-gpt", "mock-deepseek", "mock-llama"];
  };
}
