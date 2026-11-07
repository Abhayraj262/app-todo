"use client";

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

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    deleteTask(pendingDelete.id);
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
