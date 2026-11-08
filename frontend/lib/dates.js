// Home uses a rolling range: the start day plus the next seven days.
// groupTasksByWeek still groups Monday through Sunday.

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, amount) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = monday.getDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  monday.setDate(monday.getDate() - daysFromMonday);
  return monday;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function shiftDateKey(key, amount) {
  return toDateKey(addDays(parseDateKey(key), amount));
}

export function formatDateRange(startKey, endKey) {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const day = (value) => value.getDate();
  const month = (value) => value.toLocaleDateString("en-GB", { month: "short" });

  if (start.getFullYear() !== end.getFullYear()) {
    return `${day(start)} ${month(start)} ${start.getFullYear()} – ${day(end)} ${month(end)} ${end.getFullYear()}`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${day(start)} ${month(start)} – ${day(end)} ${month(end)}`;
  }
  return `${day(start)}–${day(end)} ${month(end)}`;
}

export function formatWeekRange(monday) {
  const sunday = addDays(monday, 6);
  const day = (value) => value.getDate();
  const month = (value) => value.toLocaleDateString("en-GB", { month: "short" });

  if (monday.getMonth() === sunday.getMonth()) {
    return `${day(monday)}–${day(sunday)} ${month(sunday)}`;
  }

  return `${day(monday)} ${month(monday)} – ${day(sunday)} ${month(sunday)}`;
}

export function formatTaskDate(key) {
  return parseDateKey(key).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatTime(value) {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function groupTasksByWeek(tasks) {
  const currentKey = toDateKey(startOfWeek(new Date()));
  const weeks = new Map();

  function ensureWeek(mondayKey) {
    if (!weeks.has(mondayKey)) {
      const monday = parseDateKey(mondayKey);
      weeks.set(mondayKey, {
        id: mondayKey,
        label: formatWeekRange(monday),
        isCurrent: mondayKey === currentKey,
        tasks: [],
        openCount: 0,
        completedCount: 0,
      });
    }
    return weeks.get(mondayKey);
  }

  // The current week stays on screen even when it has no tasks yet.
  ensureWeek(currentKey);

  tasks.forEach((task) => {
    if (!task.date) return;
    const mondayKey = toDateKey(startOfWeek(parseDateKey(task.date)));
    ensureWeek(mondayKey).tasks.push(task);
  });

  const list = Array.from(weeks.values());

  list.forEach((week) => {
    week.tasks.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || "").localeCompare(b.startTime || "");
    });
    week.openCount = week.tasks.filter((task) => task.status !== "completed").length;
    week.completedCount = week.tasks.filter((task) => task.status === "completed").length;
  });

  list.sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return b.id.localeCompare(a.id);
  });

  return list;
}
