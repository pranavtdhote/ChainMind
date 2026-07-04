import { Router, Request, Response } from "express";
import crypto from "crypto";
import { AgentOrchestratorService } from "../services/ai/AgentOrchestratorService";
import { ConversationModel } from "../models/Conversation";
import { MemoryEngine } from "../services/MemoryEngine";

const router = Router();
const orchestratorService = new AgentOrchestratorService();

/**
 * POST /api/chat
 * Runs the full swarm orchestration loop via SSE, then persists the conversation
 * and compiles a Memory Passport to IPFS.
 */
router.post("/", async (req: Request, res: Response) => {
  const { message, ownerWallet } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ success: false, error: "Prompt message is required." });
    return;
  }

  // Set up Server-Sent Events (SSE) headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const conversationId = "conv_" + crypto.randomBytes(8).toString("hex");
  const wallet = ownerWallet || "0x0000000000000000000000000000000000000000";
  const collectedLogs: any[] = [];

  console.log(`[ChatRouter]: Initiating SSE stream for prompt: "${message}" | ConvID: ${conversationId}`);

  try {
    const finalContext = await orchestratorService.orchestrate(message, (log) => {
      collectedLogs.push(log);
      res.write(`data: ${JSON.stringify(log)}\n\n`);
    });

    // After orchestration completes, compile Memory Passport to IPFS
    let cid = "";
    try {
      const passport = await MemoryEngine.compileMemoryPassport(finalContext, wallet);
      cid = passport.cid;
      console.log(`[ChatRouter]: Memory Passport created with CID: ${cid}`);

      // Notify client about the passport
      res.write(`data: ${JSON.stringify({
        step: "MemoryPassport",
        status: "completed",
        message: `Memory Passport compiled and uploaded to IPFS. CID: ${cid}`,
        timestamp: Date.now(),
        cid,
        memoryId: passport.memoryId,
      })}\n\n`);
    } catch (memErr: any) {
      console.error("[ChatRouter]: Failed to compile Memory Passport:", memErr);
      res.write(`data: ${JSON.stringify({
        step: "MemoryPassport",
        status: "failed",
        message: `Memory Passport compilation failed: ${memErr.message}`,
        timestamp: Date.now(),
      })}\n\n`);
    }

    // Save conversation to database
    try {
      await ConversationModel.create({
        conversationId,
        prompt: message,
        projectName: finalContext.projectName || "ChainMind Project",
        logs: collectedLogs.map((l) => ({
          step: l.step,
          agentRole: l.agentRole || "",
          status: l.status,
          message: l.message,
          timestamp: l.timestamp,
        })),
        context: finalContext,
        cid,
        courtReportId: finalContext.courtReport?.courtId || "",
        ownerWallet: wallet,
      });
      console.log(`[ChatRouter]: Conversation ${conversationId} saved to database.`);
    } catch (dbErr: any) {
      console.error("[ChatRouter]: Failed to save conversation:", dbErr);
    }

    // Send final closing event
    res.write(`data: ${JSON.stringify({
      step: "Finalize",
      status: "completed",
      message: "Swarm execution complete. Memory anchored.",
      conversationId,
      cid,
      timestamp: Date.now(),
    })}\n\n`);
    res.write("data: [DONE]\n\n");
  } catch (error: any) {
    console.error("[ChatRouter]: SSE Orchestration loop crashed:", error);
    res.write(`data: ${JSON.stringify({ step: "Error", status: "failed", message: error.message || "Execution exception occurred." })}\n\n`);
  } finally {
    res.end();
  }
});

/**
 * GET /api/chat/history
 * Returns all saved conversations, newest first.
 */
router.get("/history", async (req: Request, res: Response) => {
  try {
    const conversations = await ConversationModel.find({})
      .sort({ createdAt: -1 })
      .select("conversationId prompt projectName cid createdAt")
      .limit(50);
    res.status(200).json({ success: true, data: conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/chat/:id
 * Returns full conversation details by conversationId.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const conversation = await ConversationModel.findOne({ conversationId: id as string });
    if (!conversation) {
      res.status(404).json({ success: false, error: "Conversation not found." });
      return;
    }
    res.status(200).json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
