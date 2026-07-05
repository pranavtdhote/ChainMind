import { Request, Response } from "express";
import mongoose from "mongoose";
import { NotificationService } from "../services/NotificationService";
import { ActivityModel } from "../models/Activity";

export class SystemController {
  getHealth = async (req: Request, res: Response): Promise<void> => {
    const dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

    let blockchainStatus = "connected";
    try {
      const { ethers } = await import("ethers");
      const provider = new ethers.JsonRpcProvider(process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz");
      await provider.getBlockNumber();
    } catch {
      blockchainStatus = "disconnected";
    }

    res.status(200).json({
      status: "online",
      database: dbStatus,
      blockchain: blockchainStatus,
      redis: "disabled",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  };

  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const notifications = NotificationService.getNotifications();
      res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getActivities = async (req: Request, res: Response): Promise<void> => {
    try {
      const activities = await ActivityModel.find({})
        .sort({ createdAt: -1 })
        .limit(50);
      res.status(200).json({ success: true, data: activities });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  markNotificationsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      NotificationService.markAllAsRead();
      res.status(200).json({ success: true, message: "Notifications marked as read" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  clearNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      NotificationService.clearNotifications();
      res.status(200).json({ success: true, message: "Notifications cleared" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
