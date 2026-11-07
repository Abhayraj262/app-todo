import mongoose from "mongoose";
import { HttpError } from "../utils/httpError.js";

export function notFound(req, res) {
  res.status(404).json({ success: false, message: "Not found" });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: "Invalid task id" });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)[0]?.message || "Invalid task";
    res.status(400).json({ success: false, message });
    return;
  }

  if (err.type === "entity.parse.failed") {
    res.status(400).json({ success: false, message: "Invalid request body" });
    return;
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Something went wrong" });
}
