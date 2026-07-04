import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";

const router = Router();
const analyticsController = new AnalyticsController();

router.get("/", analyticsController.getStats);

export default router;
