import mongoose from "mongoose";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      default: "",
      maxlength: 400,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["", "low", "medium", "high"],
      default: "",
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
  },
  { timestamps: true },
);

taskSchema.path("startTime").validate((value) => timePattern.test(value), "Choose a start time.");

taskSchema.path("endTime").validate(function validateEndTime(value) {
  if (!value) return true;
  return timePattern.test(value) && value > this.startTime;
}, "End time must be after the start time.");

export const Task = mongoose.model("Task", taskSchema);
