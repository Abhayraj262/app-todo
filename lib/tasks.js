import { addDays, startOfWeek, toDateKey } from "@/lib/dates";

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function emptyTaskForm() {
  return {
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    priority: "",
  };
}

export function taskToForm(task) {
  if (!task) return emptyTaskForm();
  return {
    title: task.title || "",
    description: task.description || "",
    date: task.date || "",
    startTime: task.startTime || "",
    endTime: task.endTime || "",
    priority: task.priority || "",
  };
}

export function validateTask(input) {
  const errors = {};

  if (!input.title.trim()) {
    errors.title = "Enter a title.";
  }

  if (!input.date) {
    errors.date = "Choose a date.";
  }

  if (!input.startTime) {
    errors.startTime = "Choose a start time.";
  }

  if (input.endTime && input.startTime && input.endTime <= input.startTime) {
    errors.endTime = "End time must be after the start time.";
  }

  return errors;
}

export function createSeedTasks() {
  const monday = startOfWeek(new Date());
  const lastMonday = addDays(monday, -7);

  return [
    {
      id: "seed-wireframe",
      title: "Finishing Wireframe",
      description: "Finish the remaining screens for the mobile flow.",
      date: toDateKey(monday),
      startTime: "09:00",
      endTime: "11:00",
      priority: "high",
      status: "in_progress",
    },
    {
      id: "seed-meeting",
      title: "Meeting with team",
      description: "Weekly sync on open tasks.",
      date: toDateKey(addDays(monday, 2)),
      startTime: "14:00",
      endTime: "15:00",
      priority: "medium",
      status: "in_progress",
    },
    {
      id: "seed-cat-food",
      title: "Buy a cat food",
      description: "",
      date: toDateKey(addDays(monday, 4)),
      startTime: "18:00",
      endTime: "",
      priority: "low",
      status: "completed",
    },
    {
      id: "seed-commission",
      title: "Finishing daily commission",
      description: "Close the commission from last week.",
      date: toDateKey(addDays(lastMonday, 3)),
      startTime: "10:00",
      endTime: "12:30",
      priority: "",
      status: "completed",
    },
  ];
}
