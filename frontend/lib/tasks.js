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
