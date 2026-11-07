"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { groupTasksByWeek } from "@/lib/dates";
import * as api from "@/lib/api";

const EMPTY_TASKS = [];
const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(EMPTY_TASKS);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    api
      .getTasks()
      .then((list) => {
        if (ignore) return;
        setTasks(Array.isArray(list) ? list : EMPTY_TASKS);
        setError("");
      })
      .catch((err) => {
        if (ignore) return;
        setTasks(EMPTY_TASKS);
        setError(err.message || "Could not load tasks.");
      })
      .finally(() => {
        if (!ignore) setReady(true);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const createTask = useCallback(async (input) => {
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

  const weeks = useMemo(() => (ready ? groupTasksByWeek(tasks) : EMPTY_TASKS), [ready, tasks]);

  const searchTasks = useCallback(
    (query) => {
      const term = query.trim().toLowerCase();
      if (!term) return [];
      return tasks.filter((task) => {
        const title = task.title.toLowerCase();
        const description = (task.description || "").toLowerCase();
        return title.includes(term) || description.includes(term);
      });
    },
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      ready,
      error,
      weeks,
      createTask,
      updateTask,
      deleteTask,
      toggleStatus,
      searchTasks,
    }),
    [tasks, ready, error, weeks, createTask, updateTask, deleteTask, toggleStatus, searchTasks],
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
