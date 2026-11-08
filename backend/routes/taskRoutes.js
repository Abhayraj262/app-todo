import { Router } from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/taskController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);
router.post("/", createTask);
router.get("/", getTasks);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
