import { Router } from "express";
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

// Mounting sub-routers
router.use("/agents", agentsRouter);
router.use("/projects", projectsRouter);
router.use("/memory", memoryRouter);
router.use("/tasks", tasksRouter);
router.use("/chat", chatRouter);
router.use("/verification", verificationRouter);
router.use("/court", courtRouter);
router.use("/system", systemRouter);
router.use("/analytics", analyticsRouter);
router.use("/settings", settingsRouter);

export default router;
