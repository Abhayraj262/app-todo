import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { HttpError } from "../utils/httpError.js";
import { send, toTask } from "../utils/response.js";
import { validateTask } from "../validators/taskValidator.js";

function readId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, "Invalid task id");
  }
  return id;
}

export async function createTask(req, res) {
  const input = validateTask({ ...req.body, status: "in_progress" });
  const task = await Task.create(input);
  send(res, 201, "Todo created successfully", toTask(task));
}

export async function getTasks(req, res) {
  const tasks = await Task.find().sort({ updatedAt: -1 });
  send(res, 200, "Todos fetched successfully", tasks.map(toTask));
}

export async function updateTask(req, res) {
  const id = readId(req.params.id);
  const existing = await Task.findById(id);
  if (!existing) {
    throw new HttpError(404, "Todo not found");
  }

  const input = validateTask({
    title: req.body.title ?? existing.title,
    description: req.body.description ?? existing.description,
    date: req.body.date ?? existing.date,
    startTime: req.body.startTime ?? existing.startTime,
    endTime: req.body.endTime ?? existing.endTime,
    priority: req.body.priority ?? existing.priority,
    status: req.body.status ?? existing.status,
  });

  existing.set(input);
  await existing.save();
  send(res, 200, "Todo updated successfully", toTask(existing));
}

export async function deleteTask(req, res) {
  const id = readId(req.params.id);
  const existing = await Task.findByIdAndDelete(id);
  if (!existing) {
    throw new HttpError(404, "Todo not found");
  }
  send(res, 200, "Todo deleted successfully", { id });
}
