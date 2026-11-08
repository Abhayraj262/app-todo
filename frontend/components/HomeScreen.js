"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import AddButton from "@/components/AddButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import GuestBanner from "@/components/GuestBanner";
import LogoutButton from "@/components/LogoutButton";
import SearchBar from "@/components/SearchBar";
import TaskRow from "@/components/TaskRow";
import TaskSheet from "@/components/TaskSheet";
import WeekCard from "@/components/WeekCard";
import { useTasks } from "@/context/TasksContext";
import { useTaskEditor } from "@/hooks/useTaskEditor";
import {
  buildHomeWeeks,
  dateKeyInRange,
  formatDateRange,
  labelForWeekMonday,
  todayKey,
  weekOffsetFromMonday,
  weekRangeKeys,
  weekStartKey,
} from "@/lib/dates";

function subscribe() {
  return () => {};
}

export default function HomeScreen() {
  const { ready, error, tasks, loadTasks, toggleStatus, deleteTask } = useTasks();
  const editor = useTaskEditor();
  const today = useSyncExternalStore(subscribe, todayKey, () => null);
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [expandedWeekId, setExpandedWeekId] = useState("");

  useEffect(() => {
    if (!today) return;
    const current = weekStartKey(today);
    setSelectedWeekId((currentId) => currentId || current);
    setExpandedWeekId((currentId) => currentId || current);
  }, [today]);

  useEffect(() => {
    loadTasks().catch(() => {});
  }, [loadTasks]);

  const weeks = useMemo(() => {
    if (!today || !selectedWeekId) return [];
    return buildHomeWeeks(tasks, today, selectedWeekId);
  }, [tasks, today, selectedWeekId]);

  const selectedWeek = weeks.find((week) => week.id === selectedWeekId);
  const weekTasks = selectedWeek?.tasks ?? [];

  const weekOffset = today && selectedWeekId ? weekOffsetFromMonday(selectedWeekId, today) : 0;
  const weekRange = today ? weekRangeKeys(today, weekOffset) : { start: "", end: "" };
  const rangeStart = weekRange.start;
  const rangeEnd = weekRange.end;
  const rangeLabel = selectedWeekId && today ? labelForWeekMonday(selectedWeekId, today) : "";
  const defaultTaskDate =
    today && rangeStart && rangeEnd && dateKeyInRange(today, rangeStart, rangeEnd) ? today : rangeStart;

  async function reload() {
    await loadTasks(undefined, { background: true });
  }

  function selectWeek(weekId) {
    if (selectedWeekId === weekId) {
      setExpandedWeekId((current) => (current === weekId ? "" : weekId));
      return;
    }
    setSelectedWeekId(weekId);
    setExpandedWeekId(weekId);
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
      {!today || !selectedWeekId ? (
        <EmptyState message="Loading tasks..." />
      ) : (
        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className="lg:max-h-[calc(100dvh-11rem)] lg:overflow-y-auto lg:pr-1">
            {error ? <EmptyState message={error} /> : null}
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[#717171]">Weeks</p>
            <div className="space-y-3">
              {weeks.map((week) => (
                <WeekCard
                  key={week.id}
                  week={week}
                  selected={week.id === selectedWeekId}
                  expanded={week.id === expandedWeekId}
                  statusLabel={labelForWeekMonday(week.id, today)}
                  onSelect={selectWeek}
                  onToggleStatus={changeStatus}
                  onEdit={editor.openEdit}
                  onAskDelete={editor.askDelete}
                  onDeleteNow={removeTask}
                />
              ))}
            </div>
          </div>
          <section className="mt-6 lg:mt-0 lg:border lg:border-[#e6e6e6] lg:bg-white lg:p-6">
            <GuestBanner />
            <div className="mb-4 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#717171]">Tasks by date</p>
                <p className="mt-1 truncate text-[15px] font-medium text-[#090e23]">{rangeLabel}</p>
                <p className="text-[13px] text-[#6e7180]">{formatDateRange(rangeStart, rangeEnd)}</p>
              </div>
              <button
                type="button"
                onClick={editor.openCreate}
                className="hidden h-12 shrink-0 bg-[#4566ec] px-5 text-[16px] font-medium text-white lg:inline-flex lg:items-center"
              >
                Add task
              </button>
            </div>
            <div className="hidden lg:block">
              {!ready ? (
                <EmptyState message="Loading tasks..." />
              ) : error && weekTasks.length === 0 ? (
                <EmptyState message={error} />
              ) : weekTasks.length === 0 ? (
                <EmptyState message="No tasks this week." />
              ) : (
                weekTasks.map((task) => (
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
            </div>
            <div className="lg:hidden">
              {!expandedWeekId ? (
                <EmptyState message="Select a week above to see tasks." />
              ) : null}
            </div>
          </section>
        </div>
      )}
      <AddButton onClick={editor.openCreate} />
      {editor.sheet ? (
        <TaskSheet
          key={`${editor.sheet.mode}-${editor.sheet.task?.id || "new"}-${rangeStart}`}
          mode={editor.sheet.mode}
          task={editor.sheet.task}
          defaultDate={defaultTaskDate}
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
