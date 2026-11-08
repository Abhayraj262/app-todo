"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import * as api from "@/lib/api";
import { createDemoTask, deleteDemoTask, isDemoMode, readDemoTasks, updateDemoTask } from "@/lib/demoTasks";

const EMPTY_TASKS = [];
const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(EMPTY_TASKS);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const loadTasks = useCallback(async (range, { background = false } = {}) => {
    const id = ++requestId.current;
    if (isDemoMode()) {
      const all = readDemoTasks();
      const list =
        range?.from && range?.to
          ? all.filter((task) => task.date >= range.from && task.date <= range.to)
          : all;
      setTasks(list);
      setError("");
      setReady(true);
      return;
    }
    if (!background) {
      setTasks(EMPTY_TASKS);
      setReady(false);
    }
    try {
      const list = await api.getTasks(range);
      if (id !== requestId.current) return;
      setTasks(Array.isArray(list) ? list : EMPTY_TASKS);
      setError("");
    } catch (err) {
      if (id !== requestId.current) return;
      setTasks(EMPTY_TASKS);
      setError(err.message || "Could not load tasks.");
    } finally {
      if (id === requestId.current) setReady(true);
    }
  }, []);

  const createTask = useCallback(async (input) => {
    if (isDemoMode()) {
      const task = createDemoTask(input);
      setTasks((current) => [task, ...current]);
      setError("");
      return task;
    }
    try {
      const task = await api.createTask(input);
      setTasks((current) => [task, ...current]);
      setError("");
      return task;
    } catch (err) {
      setError(err.message || "Could not save the task.");
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id, changes) => {
    if (isDemoMode()) {
      const task = updateDemoTask(id, changes);
      if (!task) {
        const err = new Error("Could not update the task.");
        setError(err.message);
        throw err;
      }
      setTasks((current) => current.map((item) => (item.id === id ? task : item)));
      setError("");
      return task;
    }
    try {
      const task = await api.updateTask(id, changes);
      setTasks((current) => current.map((item) => (item.id === id ? task : item)));
      setError("");
      return task;
    } catch (err) {
      setError(err.message || "Could not update the task.");
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    if (isDemoMode()) {
      deleteDemoTask(id);
      setTasks((current) => current.filter((item) => item.id !== id));
      setError("");
      return;
    }
    try {
      await api.deleteTask(id);
      setTasks((current) => current.filter((item) => item.id !== id));
      setError("");
    } catch (err) {
      setError(err.message || "Could not delete the task.");
      throw err;
    }
  }, []);

  const toggleStatus = useCallback(
    async (id) => {
      const task = tasks.find((item) => item.id === id);
      if (!task) return;
      const status = task.status === "completed" ? "in_progress" : "completed";
      await updateTask(id, { status });
    },
    [tasks, updateTask],
  );

  const searchTasks = useCallback(
    (query) => {
      const term = query.trim().toLowerCase();
      if (!term) return [];
      return tasks.filter((task) => {
        const title = task.title.toLowerCase();
        const description = (task.description || "").toLowerCase();
        const priority = (task.priority || "").toLowerCase();
        return title.includes(term) || description.includes(term) || (priority && priority.includes(term));
      });
    },
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      ready,
      error,
      loadTasks,
      createTask,
      updateTask,
      deleteTask,
      toggleStatus,
      searchTasks,
    }),
    [tasks, ready, error, loadTasks, createTask, updateTask, deleteTask, toggleStatus, searchTasks],
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
