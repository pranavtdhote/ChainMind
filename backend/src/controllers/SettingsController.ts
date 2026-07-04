import { Request, Response } from "express";

export class SettingsController {
  getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          groqApiKeySet: true,
          monadRPC: "https://testnet-rpc.monad.xyz",
          ipfsGateway: "https://api.pinata.cloud",
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { monadRPC, ipfsGateway } = req.body;
      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: { monadRPC, ipfsGateway },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
