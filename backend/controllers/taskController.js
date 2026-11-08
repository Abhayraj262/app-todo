// CRUD for todos. Every query scopes by req.userId so users only touch their own tasks.
import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { HttpError } from "../utils/httpError.js";
import { send, toTask } from "../utils/response.js";
import { validateTask } from "../validators/taskValidator.js";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function readId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, "Invalid task id");
  }
  return id;
}

// Optional ?from=YYYY-MM-DD&to=YYYY-MM-DD on GET /api/tasks (Home loads all tasks without a range).
function readRange(query) {
  const from = query.from ? String(query.from) : "";
  const to = query.to ? String(query.to) : "";
  if (!from && !to) return null;
  if (!datePattern.test(from) || !datePattern.test(to) || from > to) {
    throw new HttpError(400, "Choose a valid date range.");
  }
  return { from, to };
}

export async function createTask(req, res) {
  const input = validateTask({ ...req.body, status: "in_progress" });
  const task = await Task.create({ ...input, user: req.userId });
  send(res, 201, "Todo created successfully", toTask(task));
}

export async function getTasks(req, res) {
  const range = readRange(req.query);
  const filter = { user: req.userId };
  if (range) {
    filter.date = { $gte: range.from, $lte: range.to };
  }
  const tasks = await Task.find(filter).sort({ date: 1, startTime: 1 });
  send(res, 200, "Todos fetched successfully", tasks.map(toTask));
}

export async function updateTask(req, res) {
  const id = readId(req.params.id);
  const existing = await Task.findOne({ _id: id, user: req.userId });
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
  const existing = await Task.findOneAndDelete({ _id: id, user: req.userId });
  if (!existing) {
    throw new HttpError(404, "Todo not found");
  }
  send(res, 200, "Todo deleted successfully", { id });
}
