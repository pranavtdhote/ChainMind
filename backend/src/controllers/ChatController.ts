import { Request, Response } from "express";

export class ChatController {
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messages, projectId } = req.body;
      res.status(200).json({
        success: true,
        data: {
          sender: "Architect Agent",
          role: "System Designer",
          content: "Mock reply from Architect Agent: Proceeding with execution path.",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
