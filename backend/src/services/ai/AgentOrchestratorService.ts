import { AgentRegistry } from "./AgentRegistry";
import { TaskPlanner } from "./TaskPlanner";
import { SharedContext, TaskGraph, AgentOrchestrationLog, SubTask } from "../../types/orchestrator";
import { blockchainSubscriber } from "../BlockchainSubscriber";

export class AgentOrchestratorService {
  private registry: AgentRegistry;
  private planner: TaskPlanner;

  constructor() {
    this.registry = AgentRegistry.getInstance();
    this.planner = new TaskPlanner();
  }

  /**
   * Executes the full orchestration loop.
   * @param goal User prompt.
   * @param onStepCallback Event callback to stream progress logs.
   */
  async orchestrate(
    goal: string,
    onStepCallback: (log: AgentOrchestrationLog) => void
  ): Promise<SharedContext> {
    const timestamp = Date.now();
    
    // 1. Initialize Shared Context
    let context: SharedContext = {
      projectName: "ChainMind Dynamic Project",
      userGoal: goal,
      requirements: [],
      currentTask: "Orchestration Planning",
      completedTasks: [],
      pendingTasks: [],
      agentHistory: [],
      currentStatus: "Planning",
      timestamp,
      contextVersion: 1,
    };

    // Emit initial log
    onStepCallback({
      step: "Planning",
      status: "started",
      message: "Analyzing user prompt and breaking into subtasks...",
      timestamp: Date.now(),
      context: { ...context },
    });

    // 2. Generate execution graph from planner
    let graph: TaskGraph;
    try {
      graph = await this.planner.planTask(goal);
      context.projectName = graph.projectName;
      context.pendingTasks = graph.tasks.map((t) => t.description);
      
      onStepCallback({
        step: "Planning",
        status: "completed",
        message: `Task Graph generated for "${graph.projectName}". Selected ${graph.tasks.length} agents.`,
        timestamp: Date.now(),
        context: { ...context },
      });
    } catch (err: any) {
      onStepCallback({
        step: "Planning",
        status: "failed",
        message: `Planning failed: ${err.message}. Using fallback layout.`,
        timestamp: Date.now(),
      });
      // Fallback
      graph = {
        projectName: "Fallback Swarm",
        goal,
        tasks: [
          { id: "task_1", agentRole: "Research", description: "Audit requirements and research dependencies", priority: "High", status: "Pending" },
          { id: "task_2", agentRole: "Developer", description: "Build code modules matching requirements", priority: "High", status: "Pending" },
          { id: "task_3", agentRole: "Verifier", description: "Verify safety and logical correctness", priority: "Medium", status: "Pending" }
        ]
      };
      context.projectName = graph.projectName;
      context.pendingTasks = graph.tasks.map((t) => t.description);
    }

    // 3. Sequentially execute each task in the graph
    for (const task of graph.tasks) {
      const { agentRole, description } = task;
      const registryEntry = this.registry.getAgentByRole(agentRole);

      if (!registryEntry) {
        onStepCallback({
          step: agentRole,
          status: "failed",
          message: `Agent for role ${agentRole} is not registered in the swarm. Skipping.`,
          timestamp: Date.now(),
        });
        continue;
      }

      const agent = registryEntry.agent;

      // Update context task trackers
      context.currentTask = description;
      context.currentStatus = `${agentRole} Execution`;
      
      // Update Agent Registry Status
      this.registry.setAgentStatus(agentRole, "Busy", description);

      // Event trigger
      await blockchainSubscriber.handleEvent("TaskCreated", {
        taskId: task.id,
        description: description,
        priority: task.priority || "Medium",
        creator: "0x892a014aef37b12dcf012a45ebfa89018bc79e8c"
      });
      await blockchainSubscriber.handleEvent("TaskAssigned", {
        taskId: task.id,
        assignedAgent: agent.id
      });

      onStepCallback({
        step: agentRole,
        agentId: agent.id,
        agentRole,
        status: "started",
        message: `Starting task: "${description}"`,
        timestamp: Date.now(),
        context: { ...context },
      });

      let output: any = null;
      let success = false;

      if (agentRole === "Verifier") {
        // Run AgentCourt trial instead of basic execution!
        let trialSuccess = false;
        let trialsCount = 0;
        const maxTrials = 2; // Retry revisions up to 2 times
        const CourtService = (await import("../CourtService")).CourtService;

        while (!trialSuccess && trialsCount <= maxTrials) {
          onStepCallback({
            step: "AgentCourt",
            status: "started",
            message: `AgentCourt Trial #${trialsCount + 1}: Convening courtroom to audit artifacts.`,
            timestamp: Date.now(),
            context: { ...context }
          });

          // Event trigger
          await blockchainSubscriber.handleEvent("VerificationStarted", {
            caseId: "case_" + Math.random().toString(36).substring(7),
            taskId: task.id,
            evidenceHash: "QmEvidenceHashMock1028"
          });

          // Run the trial
          const report = await CourtService.runCourtTrial(context, "0x892a014aef37b12dcf012a45ebfa89018bc79e8c");
          
          // Save court report in the context
          context.courtReport = report;

          if (report.approved) {
            trialSuccess = true;
            output = {
              integrityScore: report.integrityScore,
              confidence: report.confidenceScore,
              issues: [],
              approved: true,
              courtReportId: report.courtId
            };
            await blockchainSubscriber.handleEvent("VerificationCompleted", {
              approved: true,
              consensusScore: report.consensusScore
            });
          } else {
            trialsCount++;
            if (trialsCount > maxTrials) {
              onStepCallback({
                step: "AgentCourt",
                status: "failed",
                message: `AgentCourt rejected final revision. Consensus: ${report.consensusScore}%. Continuing with unresolved issues.`,
                timestamp: Date.now(),
                context: { ...context }
              });
              await blockchainSubscriber.handleEvent("VerificationCompleted", {
                approved: false,
                consensusScore: report.consensusScore
              });
              output = {
                integrityScore: report.integrityScore,
                confidence: report.confidenceScore,
                issues: report.violations,
                approved: false,
                courtReportId: report.courtId
              };
              trialSuccess = true; // Break loop
            } else {
              onStepCallback({
                step: "AgentCourt",
                status: "failed",
                message: `AgentCourt found ${report.violations.length} violations (Consensus: ${report.consensusScore}%). Routing feedback loop to Manager and Developer...`,
                timestamp: Date.now(),
                context: { ...context }
              });

              // Trigger interactive feedback loop:
              // 1. Manager designs revision instructions based on violations
              const feedbackInstructions = `AgentCourt rejected code with ${report.violations.length} issues: ${report.violations.join("; ")}. Please revise the generated modules to address these issues. Recommendations: ${report.recommendations.join("; ")}`;
              context.feedbackInstructions = feedbackInstructions;

              // 2. Developer Agent revises output
              onStepCallback({
                step: "Developer",
                status: "started",
                message: `Developer Agent revising code based on AgentCourt feedback: "${feedbackInstructions.substring(0, 100)}..."`,
                timestamp: Date.now(),
                context: { ...context }
              });

              const devAgentEntry = this.registry.getAgentByRole("Developer");
              if (devAgentEntry) {
                const devOutput = await devAgentEntry.agent.execute(context);
                context.developerOutput = devOutput; // Overwrite developer output with revised version
                context.contextVersion += 1;
                context.agentHistory.push({
                  agentId: devAgentEntry.agent.id,
                  agentName: devAgentEntry.agent.name,
                  role: "Developer",
                  action: `Revised Developer code output for version V${context.contextVersion}. Restored compatibility with specifications.`,
                  timestamp: Date.now()
                });
              }
            }
          }
        }
        success = true;
      } else {
        let retries = 0;
        const maxRetries = agentRole === "Research" ? 2 : 0; // Retry up to 2 times specifically for Research failures

        while (!success && retries <= maxRetries) {
          try {
            // Execute Agent
            output = await agent.execute(context);
            
            // Validate Structured Output
            if (!agent.validateOutput(output)) {
              throw new Error(`Output validation failed for agent ${agent.name}`);
            }
            
            success = true;
          } catch (err: any) {
            retries++;
            console.warn(`[Orchestrator]: Agent ${agent.name} failed (Attempt ${retries}/${maxRetries + 1}):`, err.message);
            
            if (retries > maxRetries) {
              // Handle failures specifically per role
              if (agentRole === "Developer") {
                // Developers return a structured compiler/logical error
                output = {
                  implementationSummary: "Development execution failed.",
                  generatedModules: [],
                  error: err.message || "Unknown compilation failure.",
                };
                success = true; // Let the flow continue so we return structured errors
              } else {
                // General failure
                task.status = "Failed";
                this.registry.setAgentStatus(agentRole, "Online");
                onStepCallback({
                  step: agentRole,
                  agentId: agent.id,
                  agentRole,
                  status: "failed",
                  message: `Task failed after maximum retries: ${err.message}`,
                  timestamp: Date.now(),
                });
                break; // Break the execution loop for this agent
              }
            } else {
              // Sleep briefly before retrying
              await new Promise((r) => setTimeout(r, 1000));
            }
          }
        }
      }

      if (success && output) {
        // Save Artifacts into Shared Context
        this.saveArtifactToContext(agentRole, output, context);

        // Update context tasks trackers
        context.completedTasks.push(description);
        context.completedTasks.push(agentRole);
        context.pendingTasks = context.pendingTasks.filter((t) => t !== description);
        
        // Append history audit log
        context.agentHistory.push({
          agentId: agent.id,
          agentName: agent.name,
          role: agentRole,
          action: agent.generateSummary(output),
          timestamp: Date.now(),
        });

        // Event trigger
        await blockchainSubscriber.handleEvent("TaskCompleted", {
          taskId: task.id,
          actualTime: 120
        });

        context.contextVersion += 1;
        
        // Reset Agent Registry Status
        this.registry.setAgentStatus(agentRole, "Online");

        onStepCallback({
          step: agentRole,
          agentId: agent.id,
          agentRole,
          status: "completed",
          message: agent.generateSummary(output),
          timestamp: Date.now(),
          context: { ...context },
        });
      }
    }

    // 4. Wrap up and return final context
    context.currentTask = "Task Completed";
    context.currentStatus = "Success";

    // Event trigger for Memory anchored
    await blockchainSubscriber.handleEvent("MemoryCreated", {
      ipfsHash: "QmCM" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      wallet: "0x892a014aef37b12dcf012a45ebfa89018bc79e8c",
      projectName: context.projectName
    });

    onStepCallback({
      step: "Finalize",
      status: "completed",
      message: "Agent swarm execution finished successfully! Knowledge Base compiled.",
      timestamp: Date.now(),
      context: { ...context },
    });

    return context;
  }

  private saveArtifactToContext(role: string, output: any, context: SharedContext) {
    switch (role) {
      case "Research":
        context.researchOutput = output;
        if (output && Array.isArray(output.recommendations)) {
          context.requirements = [...output.recommendations];
        }
        break;
      case "Developer":
        context.developerOutput = output;
        break;
      case "UI Designer":
        context.uiOutput = output;
        break;
      case "Documentation":
        context.documentation = output;
        break;
      case "Verifier":
        context.verificationOutput = output;
        break;
      default:
        break;
    }
  }
}
