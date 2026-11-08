"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import LogoutButton from "@/components/LogoutButton";
import SearchBar from "@/components/SearchBar";
import TaskRow from "@/components/TaskRow";
import TaskSheet from "@/components/TaskSheet";
import { useTasks } from "@/context/TasksContext";
import { useTaskEditor } from "@/hooks/useTaskEditor";

export default function SearchScreen() {
  const { ready, error, tasks, loadTasks, searchTasks, deleteTask, toggleStatus } = useTasks();
  const editor = useTaskEditor();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchTasks(query), [query, searchTasks]);
  const term = query.trim();

  useEffect(() => {
    loadTasks().catch(() => {});
  }, [loadTasks]);

  let message = "";
  if (!ready) message = "Loading tasks...";
  else if (error && tasks.length === 0) message = error;
  else if (!term) message = "Type a keyword to search tasks.";
  else if (results.length === 0) message = "No tasks found.";

  return (
    <main className="min-h-dvh px-6 pt-6 pb-10 lg:mx-auto lg:max-w-3xl lg:px-8 lg:pt-10">
      <div className="flex items-center justify-between">
        <Link href="/home" aria-label="Back to tasks" className="inline-flex size-6 items-center justify-center">
          <img src="/icons/arrow-left.svg" alt="" width={24} height={24} />
        </Link>
        <LogoutButton />
      </div>
      <h1 className="sr-only">Search tasks</h1>
      <p className="hidden text-[28px] font-semibold text-[#090e23] lg:mt-6 lg:block">Search</p>
      <div className="mt-6">
        <SearchBar value={query} onChange={setQuery} autoFocus />
      </div>
      <div className="mt-6">
        {error && tasks.length > 0 ? <EmptyState message={error} /> : null}
        {message ? (
          <EmptyState message={message} />
        ) : (
          results.map((task) => (
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
      {editor.sheet ? (
        <TaskSheet
          key={`${editor.sheet.mode}-${editor.sheet.task?.id || "new"}`}
          mode={editor.sheet.mode}
          task={editor.sheet.task}
          onClose={editor.closeSheet}
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
