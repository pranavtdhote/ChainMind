import { Router, Request, Response } from "express";
import { CourtReportModel } from "../models/CourtReport";
import { CourtService } from "../services/CourtService";

const router = Router();

/**
 * POST /api/court/verify
 * Triggers courtroom analysis on a SharedContext.
 */
router.post("/verify", async (req: Request, res: Response) => {
  const { context, ownerWallet = "0x892a014aef37b12dcf012a45ebfa89018bc79e8c" } = req.body;

  if (!context) {
    res.status(400).json({ success: false, error: "SharedContext 'context' parameter is required." });
    return;
  }

  try {
    const report = await CourtService.runCourtTrial(context, ownerWallet);
    res.status(201).json({ success: true, data: report });
  } catch (error: any) {
    console.error("[CourtRouter]: Verify execution failed:", error);
    res.status(500).json({ success: false, error: error.message || "Verification trial crashed." });
  }
});

/**
 * GET /api/court
 * Lists all court reports with search filters.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { q, limit = "10", page = "1" } = req.query;

    const query: any = {};
    if (q) {
      query.projectName = new RegExp(q as string, "i");
    }

    const pageSize = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const skipSize = (pageNum - 1) * pageSize;

    const reports = await CourtReportModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skipSize)
      .limit(pageSize);

    const total = await CourtReportModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
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
 * GET /api/court/history
 * Returns historical logs list.
 */
router.get("/history", async (req: Request, res: Response) => {
  try {
    const history = await CourtReportModel.find({})
      .sort({ createdAt: -1 })
      .select("courtId projectName integrityScore consensusScore approved timestamp");
    res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/court/statistics
 * Returns verification stats dashboard parameters.
 */
router.get("/statistics", async (req: Request, res: Response) => {
  try {
    const totalReports = await CourtReportModel.countDocuments({});
    
    // Average scores
    const stats = await CourtReportModel.aggregate([
      {
        $group: {
          _id: null,
          avgIntegrity: { $avg: "$integrityScore" },
          avgConsensus: { $avg: "$consensusScore" },
          avgConfidence: { $avg: "$confidenceScore" },
        },
      },
    ]);

    const approvedCount = await CourtReportModel.countDocuments({ approved: true });
    const rejectedCount = await CourtReportModel.countDocuments({ approved: false });

    const avgStats = stats[0] || { avgIntegrity: 100, avgConsensus: 100, avgConfidence: 100 };

    res.status(200).json({
      success: true,
      data: {
        totalCases: totalReports,
        averageIntegrity: Math.round(avgStats.avgIntegrity),
        averageConsensus: Math.round(avgStats.avgConsensus),
        averageConfidence: Math.round(avgStats.avgConfidence),
        failedVerifications: rejectedCount,
        approvedCount,
        approvalRate: totalReports > 0 ? Math.round((approvedCount / totalReports) * 100) : 100,
        courtStatus: "Active",
        verifierStatus: "Online",
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/court/report/:id
 * Fetches specific trial report by court ID.
 */
router.get("/report/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const report = await CourtReportModel.findOne({ courtId: id as string });
    if (!report) {
      res.status(404).json({ success: false, error: "Court trial report not found." });
      return;
    }
    res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/court/report/:id/anchor
 * Updates court report with actual transaction hash and case ID after on-chain anchoring.
 */
router.put("/report/:id/anchor", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { transactionHash, onChainCaseId } = req.body;

  if (!transactionHash) {
    res.status(400).json({ success: false, error: "transactionHash is required." });
    return;
  }

  try {
    const report = await CourtReportModel.findOne({ courtId: id as string });
    if (!report) {
      res.status(404).json({ success: false, error: "Court trial report not found." });
      return;
    }

    report.transactionHash = transactionHash;
    report.isAnchored = true;
    if (onChainCaseId) {
      report.courtId = onChainCaseId;
    }
    await report.save();

    res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    console.error("[CourtRouter]: Failed to update transaction anchor:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to save on-chain tx hash." });
  }
});

export default router;
