"use client";

// Shared UI state for TaskSheet (create/edit) and ConfirmDialog (delete) on Home and Search.
import { useCallback, useState } from "react";
import { useTasks } from "@/context/TasksContext";

export function useTaskEditor() {
  const { deleteTask } = useTasks();
  const [sheet, setSheet] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const openCreate = useCallback(() => setSheet({ mode: "create" }), []);
  const openEdit = useCallback((task) => setSheet({ mode: "edit", task }), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const askDelete = useCallback((task) => setPendingDelete(task), []);
  const cancelDelete = useCallback(() => setPendingDelete(null), []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteTask(pendingDelete.id);
    } catch {
      // The task list keeps the error message from the request.
    }
    setPendingDelete(null);
  }, [deleteTask, pendingDelete]);

  return {
    sheet,
    openCreate,
    openEdit,
    closeSheet,
    pendingDelete,
    askDelete,
    cancelDelete,
    confirmDelete,
  };
}
