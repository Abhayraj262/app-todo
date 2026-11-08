// Guest mode: tasks live in sessionStorage only (cleared on tab close, never sent to MongoDB).
import { shiftDateKey, todayKey, weekRangeKeys } from "@/lib/dates";

export const DEMO_KEY = "todo-demo";
const DEMO_TASKS_KEY = "todo-demo-tasks";

export function isDemoMode() {
  return typeof window !== "undefined" && sessionStorage.getItem(DEMO_KEY) === "1";
}

export function clearDemoSession() {
  sessionStorage.removeItem(DEMO_KEY);
  sessionStorage.removeItem(DEMO_TASKS_KEY);
}

function sampleTasks() {
  const today = todayKey();
  const nextWeek = weekRangeKeys(today, 1);
  return [
    {
      id: "demo-prev",
      title: "Finish last week's notes",
      description: "A sample task from the previous range.",
      date: shiftDateKey(today, -3),
      startTime: "10:00",
      endTime: "11:00",
      priority: "low",
      status: "completed",
    },
    {
      id: "demo-today",
      title: "Plan the day",
      description: "A sample task for today.",
      date: today,
      startTime: "09:00",
      endTime: "09:30",
      priority: "high",
      status: "in_progress",
    },
    {
      id: "demo-soon",
      title: "Buy groceries",
      description: "",
      date: shiftDateKey(today, 2),
      startTime: "18:00",
      endTime: "",
      priority: "medium",
      status: "in_progress",
    },
    {
      id: "demo-done",
      title: "Call the team",
      description: "A completed sample task.",
      date: shiftDateKey(today, 4),
      startTime: "15:00",
      endTime: "15:30",
      priority: "",
      status: "completed",
    },
    {
      id: "demo-next",
      title: "Prepare next week's list",
      description: "This sample sits in the next range.",
      date: nextWeek.start,
      startTime: "11:00",
      endTime: "",
      priority: "low",
      status: "in_progress",
    },
  ];
}

export function seedDemoTasks() {
  if (sessionStorage.getItem(DEMO_TASKS_KEY)) return;
  sessionStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(sampleTasks()));
}

export function readDemoTasks() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(DEMO_TASKS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDemoTasks(tasks) {
  sessionStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(tasks));
}

export function createDemoTask(input) {
  const task = {
    id: `demo-${crypto.randomUUID()}`,
    title: input.title,
    description: input.description || "",
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime || "",
    priority: input.priority || "",
    status: "in_progress",
  };
  writeDemoTasks([task, ...readDemoTasks()]);
  return task;
}

export function updateDemoTask(id, changes) {
  const next = readDemoTasks().map((task) => (task.id === id ? { ...task, ...changes, id: task.id } : task));
  writeDemoTasks(next);
  return next.find((task) => task.id === id) || null;
}

export function deleteDemoTask(id) {
  writeDemoTasks(readDemoTasks().filter((task) => task.id !== id));
}
