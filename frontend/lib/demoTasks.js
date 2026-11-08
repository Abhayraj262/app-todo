import { shiftDateKey, todayKey } from "@/lib/dates";

export const DEMO_KEY = "todo-demo";

export function isDemoMode() {
  return typeof window !== "undefined" && sessionStorage.getItem(DEMO_KEY) === "1";
}

export function demoTasks() {
  const today = todayKey();
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
      date: shiftDateKey(today, 8),
      startTime: "11:00",
      endTime: "",
      priority: "low",
      status: "in_progress",
    },
  ];
}
