"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatTaskDate } from "@/lib/dates";
import { PRIORITIES, taskToForm, validateTask } from "@/lib/tasks";
import { useTasks } from "@/context/TasksContext";

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 bg-[#ffe6e7] px-2 py-1 text-[12px] text-[#090e23]">{children}</p>;
}

export default function TaskSheet({ mode, task, onClose, onSaved, defaultDate = "", minDate = "", maxDate = "" }) {
  const { createTask, updateTask } = useTasks();
  const [form, setForm] = useState(() => {
    const next = taskToForm(task);
    if (!task && defaultDate) next.date = defaultDate;
    return next;
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);
  const titleId = useId();
  const editing = mode === "edit";

  useEffect(() => {
    titleRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name] && name !== "startTime") return current;
      const next = { ...current };
      delete next[name];
      if (name === "startTime" || name === "endTime") delete next.endTime;
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    };
    const nextErrors = validateTask(next);
    if (next.date && ((minDate && next.date < minDate) || (maxDate && next.date > maxDate))) {
      nextErrors.date = "Choose a date in this range.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      if (editing && task) {
        await updateTask(task.id, next);
      } else {
        await createTask(next);
      }
      onSaved?.(next.date);
      onClose();
    } catch (err) {
      setErrors((current) => ({
        ...current,
        form: err.message || "Could not save the task.",
      }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center lg:items-center lg:p-6">
      <button type="button" aria-label="Close task form" className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92dvh] w-full max-w-[640px] flex-col overflow-hidden bg-white lg:max-h-[85dvh] lg:max-w-[520px]"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 id={titleId} className="text-[18px] font-medium text-[#090e23]">
            {editing ? "Edit Task" : "Add New Task"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-6 items-center justify-center">
            <img src="/icons/close.svg" alt="" width={16} height={16} className="rotate-45" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-4">
            <label className="block">
              <span className="text-[12px] font-medium text-[#717171]">Task title</span>
              <input
                ref={titleRef}
                value={form.title}
                maxLength={80}
                onChange={(event) => updateField("title", event.target.value)}
                className="mt-2 h-10 w-full border border-[#eaeaea] bg-white px-2.5 text-[14px] text-[#090e23] outline-none"
              />
              <FieldError>{errors.title}</FieldError>
            </label>

            <fieldset>
              <legend className="text-[12px] font-medium text-[#717171]">Set Time</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="relative flex h-10 items-center border border-[#eaeaea] bg-white px-2.5">
                    <img src="/icons/clock.svg" alt="" width={13} height={13} />
                    <span className="sr-only">Start time</span>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(event) => updateField("startTime", event.target.value)}
                      className="ml-2 min-w-0 flex-1 bg-transparent text-[14px] text-[#090e23] outline-none"
                    />
                  </label>
                  <FieldError>{errors.startTime}</FieldError>
                </div>
                <div>
                  <label className="relative flex h-10 items-center border border-[#eaeaea] bg-white px-2.5">
                    <img src="/icons/clock.svg" alt="" width={13} height={13} />
                    <span className="sr-only">End time</span>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(event) => updateField("endTime", event.target.value)}
                      className="ml-2 min-w-0 flex-1 bg-transparent text-[14px] text-[#090e23] outline-none"
                    />
                  </label>
                  <FieldError>{errors.endTime}</FieldError>
                </div>
              </div>
            </fieldset>

            <div>
              <p className="text-[12px] font-medium text-[#717171]">Set Date</p>
              <label className="relative mt-2 flex h-10 items-center border border-[#eaeaea] bg-white px-2.5">
                <span className={`pointer-events-none flex-1 text-[14px] ${form.date ? "text-[#090e23]" : "text-[#717171]"}`}>
                  {form.date ? formatTaskDate(form.date) : "Set date"}
                </span>
                <img src="/icons/calendar.svg" alt="" width={15} height={13} className="pointer-events-none" />
                <span className="sr-only">Task date</span>
                <input
                  type="date"
                  value={form.date}
                  min={minDate || undefined}
                  max={maxDate || undefined}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <FieldError>{errors.date}</FieldError>
            </div>

            <label className="block">
              <span className="text-[12px] font-medium text-[#717171]">Description</span>
              <textarea
                value={form.description}
                maxLength={400}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Add Description"
                className="mt-2 h-[100px] w-full resize-none border border-[#eaeaea] bg-white px-2.5 py-2 text-[14px] text-[#090e23] outline-none placeholder:text-[#090e23]"
              />
            </label>

            <fieldset>
              <legend className="text-[12px] font-medium text-[#717171]">Priority</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {PRIORITIES.map((item) => {
                  const selected = form.priority === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateField("priority", selected ? "" : item.value)}
                      className={`h-10 text-[14px] font-medium ${
                        selected
                          ? "bg-[#4566ec] text-white"
                          : "border border-[#eaeaea] bg-white text-[#717171]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
          <div className="px-6 pt-2 pb-6">
            <FieldError>{errors.form}</FieldError>
            <button
              type="submit"
              disabled={saving}
              className="mt-2 h-12 w-full bg-[#4566ec] text-[16px] font-medium text-white disabled:opacity-70"
            >
              {saving ? "Saving..." : editing ? "Save" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
