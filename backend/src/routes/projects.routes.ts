import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { ProjectRepository } from "../repositories/ProjectRepository";

const router = Router();
const projectRepository = new ProjectRepository();
const projectController = new ProjectController(projectRepository);

router.get("/", projectController.getProjects);
router.post("/", projectController.createProject);

export default router;
