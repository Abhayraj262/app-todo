"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { groupTasksByWeek } from "@/lib/dates";
import { createSeedTasks } from "@/lib/tasks";

const STORAGE_KEY = "todo-tasks";
const EMPTY_TASKS = [];

// One shared list so every screen reads the same tasks from localStorage.
let tasks = null;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function loadTasks() {
  if (tasks) return tasks;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      tasks = createSeedTasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return tasks;
    }

    const parsed = JSON.parse(raw);
    tasks = Array.isArray(parsed) ? parsed : createSeedTasks();
  } catch {
    tasks = createSeedTasks();
  }

  return tasks;
}

function saveTasks(next) {
  tasks = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return loadTasks();
}

function getServerSnapshot() {
  return null;
}

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = stored !== null;
  const taskList = stored ?? EMPTY_TASKS

  const createTask = useCallback((input) => {
    const task = {
      id: crypto.randomUUID(),
      status: "in_progress",
      title: input.title,
      description: input.description,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      priority: input.priority,
    };
    saveTasks([task, ...loadTasks()]);
  }, []);

  const updateTask = useCallback((id, changes) => {
    saveTasks(loadTasks().map((task) => (task.id === id ? { ...task, ...changes } : task)));
  }, []);

  const deleteTask = useCallback((id) => {
    saveTasks(loadTasks().filter((task) => task.id !== id));
  }, []);

  const toggleStatus = useCallback((id) => {
    saveTasks(
      loadTasks().map((task) => {
        if (task.id !== id) return task;
        return {
          ...task,
          status: task.status === "completed" ? "in_progress" : "completed",
        };
      }),
    );
  }, []);

  const weeks = useMemo(
    () => (ready ? groupTasksByWeek(taskList) : EMPTY_TASKS),
    [ready, taskList],
  );

  const searchTasks = useCallback(
    (query) => {
      const term = query.trim().toLowerCase();
      if (!term) return [];
      return taskList.filter((task) => {
        const title = task.title.toLowerCase();
        const description = (task.description || "").toLowerCase();
        return title.includes(term) || description.includes(term);
      });
    },
    [taskList],
  );

  const value = useMemo(
    () => ({
      tasks: taskList,
      ready,
      weeks,
      createTask,
      updateTask,
      deleteTask,
      toggleStatus,
      searchTasks,
    }),
    [taskList, ready, weeks, createTask, updateTask, deleteTask, toggleStatus, searchTasks],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const value = useContext(TasksContext);
  if (!value) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return value;
}
