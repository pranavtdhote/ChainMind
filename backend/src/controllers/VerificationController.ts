import { Request, Response } from "express";

export class VerificationController {
  getCases = async (req: Request, res: Response): Promise<void> => {
    try {
      const mockCases = [
        { id: "c1", taskId: "task_1", reportURI: "QmReport...", status: "Pending", consensusScore: 0 },
      ];
      res.status(200).json({ success: true, data: mockCases });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  submitVote = async (req: Request, res: Response): Promise<void> => {
    try {
      const { caseId } = req.params;
      const { approve, agentAddress } = req.body;
      res.status(200).json({
        success: true,
        message: "Vote cast successfully",
        data: { caseId, agentAddress, approve },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
