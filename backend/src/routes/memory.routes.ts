import { Router, Request, Response } from "express";
import { MemoryPassportModel } from "../models/MemoryPassport";
import { MemoryEngine } from "../services/MemoryEngine";
import { VersionService } from "../services/VersionService";
import { AgentOrchestratorService } from "../services/ai/AgentOrchestratorService";
import { ipfsService } from "../services/IPFSService";

const router = Router();
const orchestrator = new AgentOrchestratorService();

/**
 * POST /api/memory/create
 * Runs the swarm agent sequence on user prompt, compiles output into a Memory Passport, and uploads to IPFS.
 */
router.post("/create", async (req: Request, res: Response) => {
  const { prompt, ownerWallet } = req.body;

  if (!prompt || !ownerWallet) {
    res.status(400).json({ success: false, error: "Prompt and ownerWallet address are required." });
    return;
  }

  try {
    console.log(`[MemoryRouter]: Creating passport for prompt: "${prompt}"...`);
    
    // 1. Run the swarm execution loop
    const finalContext = await orchestrator.orchestrate(prompt, (log) => {
      console.log(`  [Orchestrator Log]: ${log.message}`);
    });

    // 2. Compile into IPFS Memory Passport
    const passport = await MemoryEngine.compileMemoryPassport(finalContext, ownerWallet);

    res.status(201).json({ success: true, data: passport });
  } catch (error: any) {
    console.error("[MemoryRouter]: Failed to run and create memory passport:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to compile passport." });
  }
});

/**
 * GET /api/memory
 * Queries registered memory passports. Supports tag, technology, owner, contributor, CID search, and pagination.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { q, owner, tech, limit = "10", page = "1" } = req.query;

    const query: any = {};

    if (q) {
      const searchRegex = new RegExp(q as string, "i");
      query.$or = [
        { projectName: searchRegex },
        { description: searchRegex },
        { cid: searchRegex },
        { memoryId: searchRegex }
      ];
    }

    if (owner) {
      query.ownerWallet = (owner as string).toLowerCase();
    }

    if (typeof tech === "string") {
      query.technologies = { $in: [tech] };
    }

    const pageSize = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const skipSize = (pageNum - 1) * pageSize;

    const passports = await MemoryPassportModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skipSize)
      .limit(pageSize);

    const total = await MemoryPassportModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: passports,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/memory/history/:id
 * Retrieves git-like commits for a memory passport.
 */
router.get("/history/:id", async (req: Request, res: Response) => {
  const { id } = req.params; // MemoryId
  try {
    const history = await VersionService.getVersionHistory(id as string);
    res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/memory/:id
 * Retrieves specific passport metadata from database index.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const passport = await MemoryPassportModel.findOne({ memoryId: id as string });
    if (!passport) {
      res.status(404).json({ success: false, error: "Memory Passport not found" });
      return;
    }
    res.status(200).json({ success: true, data: passport });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/memory/version
 * Commits updates to an existing project and increments the version code.
 */
router.post("/version", async (req: Request, res: Response) => {
  const { memoryId, updatedContext, ownerWallet, diffSummary } = req.body;

  if (!memoryId || !updatedContext || !ownerWallet || !diffSummary) {
    res.status(400).json({ success: false, error: "Missing required commit body fields." });
    return;
  }

  try {
    const nextPassport = await VersionService.createNextVersion(
      memoryId,
      updatedContext,
      ownerWallet,
      diffSummary
    );
    res.status(201).json({ success: true, data: nextPassport });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/memory/upload
 * Directly pins external memory payloads to IPFS.
 */
router.post("/upload", async (req: Request, res: Response) => {
  const { payload } = req.body;
  if (!payload) {
    res.status(400).json({ success: false, error: "JSON payload is required." });
    return;
  }

  try {
    const cid = await ipfsService.uploadMemory(payload);
    res.status(200).json({ success: true, cid });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/memory/download/:cid
 * Downloads a Memory Passport from IPFS and Reconstructs the SharedContext to resume development.
 */
router.get("/download/:cid", async (req: Request, res: Response) => {
  const { cid } = req.params;
  try {
    const context = await MemoryEngine.rebuildSharedContext(cid as string);
    res.status(200).json({ success: true, data: context });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
