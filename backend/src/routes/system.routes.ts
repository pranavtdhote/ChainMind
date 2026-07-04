import { Router } from "express";
import { SystemController } from "../controllers/SystemController";

const router = Router();
const systemController = new SystemController();

router.get("/health", systemController.getHealth);
router.get("/notifications", systemController.getNotifications);
router.post("/notifications/read", systemController.markNotificationsRead);
router.post("/notifications/clear", systemController.clearNotifications);
router.get("/activities", systemController.getActivities);

export default router;
