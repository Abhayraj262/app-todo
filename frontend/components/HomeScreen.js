"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import AddButton from "@/components/AddButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import LogoutButton from "@/components/LogoutButton";
import SearchBar from "@/components/SearchBar";
import TaskRow from "@/components/TaskRow";
import TaskSheet from "@/components/TaskSheet";
import { useTasks } from "@/context/TasksContext";
import { useTaskEditor } from "@/hooks/useTaskEditor";
import { formatDateRange, shiftDateKey, todayKey } from "@/lib/dates";

function subscribe() {
  return () => {};
}

export default function HomeScreen() {
  const { ready, error, tasks, loadTasks, toggleStatus, deleteTask } = useTasks();
  const editor = useTaskEditor();
  const today = useSyncExternalStore(subscribe, todayKey, () => null);
  const [offsetDays, setOffsetDays] = useState(0);
  const rangeStart = today ? shiftDateKey(today, offsetDays) : "";
  const rangeEnd = rangeStart ? shiftDateKey(rangeStart, 7) : "";
  const openCount = tasks.filter((task) => task.status !== "completed").length;
  const completedCount = tasks.length - openCount;

  useEffect(() => {
    if (!rangeStart || !rangeEnd) return;
    loadTasks({ from: rangeStart, to: rangeEnd }).catch(() => {});
  }, [rangeStart, rangeEnd, loadTasks]);

  async function reload() {
    if (!rangeStart || !rangeEnd) return;
    await loadTasks({ from: rangeStart, to: rangeEnd }, { background: true });
  }

  async function changeStatus(id) {
    try {
      await toggleStatus(id);
      await reload();
    } catch {
      // The task list keeps the error message from the request.
    }
  }

  async function removeTask(task) {
    try {
      await deleteTask(task.id);
      await reload();
    } catch {
      // The task list keeps the error message from the request.
    }
  }

  return (
    <main className="min-h-dvh px-6 pt-6 pb-28 lg:px-8 lg:pt-8 lg:pb-10">
      <h1 className="sr-only">Tasks by week</h1>
      <header className="lg:flex lg:items-center lg:justify-between lg:gap-8">
        <p className="hidden text-[28px] font-semibold text-[#090e23] lg:block">To-Do</p>
        <div className="flex items-center gap-4 lg:w-[420px]">
          <div className="min-w-0 flex-1">
            <SearchBar href="/search" />
          </div>
          <LogoutButton />
        </div>
      </header>
      {!today ? (
        <EmptyState message="Loading tasks..." />
      ) : (
        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div>
            {error ? <EmptyState message={error} /> : null}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOffsetDays((current) => current - 8)}
                className="h-10 border border-[#eaeaea] bg-white px-3 text-[14px] text-[#090e23]"
              >
                Previous
              </button>
              <h2 className="text-center text-[18px] font-semibold text-[#090e23]">
                {formatDateRange(rangeStart, rangeEnd)}
              </h2>
              <button
                type="button"
                onClick={() => setOffsetDays((current) => current + 8)}
                className="h-10 border border-[#eaeaea] bg-white px-3 text-[14px] text-[#090e23]"
              >
                Next
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOffsetDays(0)}
              className="mt-3 h-10 border border-[#eaeaea] bg-white px-4 text-[14px] font-medium text-[#4566ec]"
            >
              Today
            </button>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-[#ffe6e7] px-3 py-3">
                <p className="text-[12px] text-[#090e23]">Open</p>
                <p className="text-[22px] font-semibold text-[#090e23]">{String(openCount).padStart(2, "0")}</p>
              </div>
              <div className="bg-[#eff2ff] px-3 py-3">
                <p className="text-[12px] text-[#090e23]">Completed</p>
                <p className="text-[22px] font-semibold text-[#090e23]">{String(completedCount).padStart(2, "0")}</p>
              </div>
            </div>
          </div>
          <section className="mt-6 lg:mt-0 lg:border lg:border-[#e6e6e6] lg:bg-white lg:p-6">
            <div className="mb-4 hidden justify-end lg:flex">
              <button
                type="button"
                onClick={editor.openCreate}
                className="h-12 bg-[#4566ec] px-5 text-[16px] font-medium text-white"
              >
                Add task
              </button>
            </div>
            {!ready ? (
              <EmptyState message="Loading tasks..." />
            ) : error && tasks.length === 0 ? (
              <EmptyState message={error} />
            ) : tasks.length === 0 ? (
              <div>
                <EmptyState message="No tasks this week." />
                <button
                  type="button"
                  onClick={editor.openCreate}
                  className="mx-auto mt-2 block text-[14px] font-medium text-[#4566ec] lg:hidden"
                >
                  Add task
                </button>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={changeStatus}
                  onEdit={editor.openEdit}
                  onAskDelete={editor.askDelete}
                  onDeleteNow={removeTask}
                />
              ))
            )}
          </section>
        </div>
      )}
      <AddButton onClick={editor.openCreate} />
      {editor.sheet ? (
        <TaskSheet
          key={`${editor.sheet.mode}-${editor.sheet.task?.id || "new"}-${rangeStart}`}
          mode={editor.sheet.mode}
          task={editor.sheet.task}
          defaultDate={rangeStart}
          minDate={rangeStart}
          maxDate={rangeEnd}
          onClose={editor.closeSheet}
          onSaved={reload}
        />
      ) : null}
      {editor.pendingDelete ? (
        <ConfirmDialog
          title="Delete task"
          message={`Delete “${editor.pendingDelete.title}”? This cannot be undone.`}
          onConfirm={async () => {
            await editor.confirmDelete();
            await reload();
          }}
          onCancel={editor.cancelDelete}
        />
      ) : null}
    </main>
  );
}
