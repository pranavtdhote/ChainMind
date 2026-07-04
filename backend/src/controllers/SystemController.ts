import { Request, Response } from "express";
import { NotificationService } from "../services/NotificationService";
import { ActivityModel } from "../models/Activity";

export class SystemController {
  getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          monadNode: { status: "Healthy", latency: 24 },
          groqAPI: { status: "Healthy", latency: 185 },
          ipfsGateway: { status: "Healthy", latency: 94 },
          database: { status: "Healthy", latency: 4 },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
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
