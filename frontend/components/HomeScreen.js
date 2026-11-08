"use client";

import { useState } from "react";
import AddButton from "@/components/AddButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import TaskRow from "@/components/TaskRow";
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
  const activeWeek = weeks.find((week) => week.id === activeWeekId) ?? null;

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
    <main className="min-h-dvh px-6 pt-6 pb-28 lg:px-8 lg:pt-8 lg:pb-10">
      <h1 className="sr-only">Tasks by week</h1>
      <header className="lg:flex lg:items-center lg:justify-between lg:gap-8">
        <p className="hidden text-[28px] font-semibold text-[#090e23] lg:block">To-Do</p>
        <div className="lg:w-[320px]">
          <SearchBar href="/search" />
        </div>
      </header>
      {!ready ? (
        <EmptyState message="Loading tasks..." />
      ) : error && tasks.length === 0 ? (
        <EmptyState message={error} />
      ) : (
        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className="space-y-4">
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
          <section className="hidden border border-[#e6e6e6] bg-white p-6 lg:block">
            {activeWeek ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#090e23]">{activeWeek.label}</h2>
                    {activeWeek.isCurrent ? <p className="text-[10px] text-[#6e7180]">This week</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={editor.openCreate}
                    className="h-12 shrink-0 bg-[#4566ec] px-5 text-[16px] font-medium text-white"
                  >
                    Add task
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-[#ffe6e7] px-3 py-3">
                    <p className="text-[12px] text-[#090e23]">Open</p>
                    <p className="text-[22px] font-semibold text-[#090e23]">
                      {String(activeWeek.openCount).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="bg-[#eff2ff] px-3 py-3">
                    <p className="text-[12px] text-[#090e23]">Completed</p>
                    <p className="text-[22px] font-semibold text-[#090e23]">
                      {String(activeWeek.completedCount).padStart(2, "0")}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  {activeWeek.tasks.length === 0 ? (
                    <EmptyState message="No tasks this week." />
                  ) : (
                    activeWeek.tasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={toggleStatus}
                        onEdit={editor.openEdit}
                        onAskDelete={editor.askDelete}
                        onDeleteNow={(item) => {
                          deleteTask(item.id).catch(() => {});
                        }}
                      />
                    ))
                  )}
                </div>
              </>
            ) : (
              <EmptyState message="Select a week." />
            )}
          </section>
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
