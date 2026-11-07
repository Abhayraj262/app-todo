import { HttpError } from "../utils/httpError.js";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const priorities = new Set(["", "low", "medium", "high"]);
const statuses = new Set(["in_progress", "completed"]);

function isRealDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// Same rules as the task form: title, date, and start time are required.
export function validateTask(input) {
  const title = String(input.title ?? "").trim();
  const description = String(input.description ?? "").trim();
  const date = String(input.date ?? "");
  const startTime = String(input.startTime ?? "");
  const endTime = String(input.endTime ?? "");
  const priority = String(input.priority ?? "");
  const status = input.status ? String(input.status) : "in_progress";
  const errors = [];

  if (!title) errors.push("Enter a title.");
  else if (title.length > 80) errors.push("Title is too long.");

  if (description.length > 400) errors.push("Description is too long.");

  if (!date || !datePattern.test(date) || !isRealDate(date)) errors.push("Choose a date.");
  if (!timePattern.test(startTime)) errors.push("Choose a start time.");
  if (endTime && (!timePattern.test(endTime) || endTime <= startTime)) {
    errors.push("End time must be after the start time.");
  }
  if (!priorities.has(priority)) errors.push("Choose a valid priority.");
  if (!statuses.has(status)) errors.push("Choose a valid status.");

  if (errors.length > 0) {
    throw new HttpError(400, errors[0]);
  }

  return { title, description, date, startTime, endTime, priority, status };
}
