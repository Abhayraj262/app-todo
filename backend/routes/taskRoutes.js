import { Router } from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/taskController.js";

const router = Router();

router.post("/", createTask);
router.get("/", getTasks);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
