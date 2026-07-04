import { Router } from "express";
import { TaskController } from "../controllers/TaskController";
import { TaskRepository } from "../repositories/TaskRepository";

const router = Router();
const taskRepository = new TaskRepository();
const taskController = new TaskController(taskRepository);

router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.post("/:taskId/assign", taskController.assignAgent);

export default router;
