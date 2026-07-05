import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import agentsRouter from "./agents.routes";
import projectsRouter from "./projects.routes";
import memoryRouter from "./memory.routes";
import tasksRouter from "./tasks.routes";
import chatRouter from "./chat.routes";
import verificationRouter from "./verification.routes";
import courtRouter from "./court.routes";
import systemRouter from "./system.routes";
import analyticsRouter from "./analytics.routes";
import settingsRouter from "./settings.routes";

const router = Router();

// Mounting health check route directly
router.get("/health", (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.status(200).json({
    success: true,
    status: "online",
    service: "ChainMind Backend",
    database: dbStatus,
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Mounting sub-routers
router.use("/agents", agentsRouter);
router.use("/projects", projectsRouter);
router.use("/memory", memoryRouter);
router.use("/tasks", tasksRouter);
router.use("/chat", chatRouter);
router.use("/swarm", chatRouter); // Swarm alias mapping to chatRouter
router.use("/verification", verificationRouter);
router.use("/court", courtRouter);
router.use("/system", systemRouter);
router.use("/analytics", analyticsRouter);
router.use("/settings", settingsRouter);

export default router;
