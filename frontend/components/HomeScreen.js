"use client";

import { useState } from "react";
import AddButton from "@/components/AddButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import TaskSheet from "@/components/TaskSheet";
import WeekCard from "@/components/WeekCard";
import { useTasks } from "@/context/TasksContext";
import { useTaskEditor } from "@/hooks/useTaskEditor";
import { parseDateKey, startOfWeek, toDateKey } from "@/lib/dates";

export default function HomeScreen() {
  const { ready, error, tasks, weeks, toggleStatus, deleteTask } = useTasks();
  const editor = useTaskEditor();
  const [openWeekId, setOpenWeekId] = useState(null);
  const [pickedWeek, setPickedWeek] = useState(false);
  const currentWeekId = weeks.find((week) => week.isCurrent)?.id ?? null;
  const activeWeekId = pickedWeek ? openWeekId : currentWeekId;

  function revealWeek(dateKey) {
    setOpenWeekId(toDateKey(startOfWeek(parseDateKey(dateKey))));
    setPickedWeek(true);
  }

  function toggleWeek(id) {
    setOpenWeekId((current) => {
      const openId = pickedWeek ? current : currentWeekId;
      return openId === id ? null : id;
    });
    setPickedWeek(true);
  }

  return (
    <main className="min-h-dvh px-6 pt-6 pb-28">
      <h1 className="sr-only">Tasks by week</h1>
      <SearchBar href="/search" />
      {!ready ? (
        <EmptyState message="Loading tasks..." />
      ) : error && tasks.length === 0 ? (
        <EmptyState message={error} />
      ) : (
        <div className="mt-6 space-y-4">
          {error ? <EmptyState message={error} /> : null}
          {weeks.map((week) => (
            <WeekCard
              key={week.id}
              week={week}
              expanded={week.id === activeWeekId}
              onToggle={toggleWeek}
              onToggleStatus={toggleStatus}
              onEdit={editor.openEdit}
              onAskDelete={editor.askDelete}
              onDeleteNow={(task) => {
                deleteTask(task.id).catch(() => {});
              }}
            />
          ))}
        </div>
      )}
      <AddButton onClick={editor.openCreate} />
      {editor.sheet ? (
        <TaskSheet
          key={`${editor.sheet.mode}-${editor.sheet.task?.id || "new"}`}
          mode={editor.sheet.mode}
          task={editor.sheet.task}
          onClose={editor.closeSheet}
          onSaved={revealWeek}
        />
      ) : null}
      {editor.pendingDelete ? (
        <ConfirmDialog
          title="Delete task"
          message={`Delete “${editor.pendingDelete.title}”? This cannot be undone.`}
          onConfirm={editor.confirmDelete}
          onCancel={editor.cancelDelete}
        />
      ) : null}
    </main>
  );
}
