"use client";

// Single task card with optional swipe-to-delete on touch devices (DELETE_WIDTH pixels).
import { useRef, useState } from "react";
import { formatTaskDate, formatTime } from "@/lib/dates";

const DELETE_WIDTH = 88;

export default function TaskRow({ task, onToggle, onEdit, onAskDelete, onDeleteNow }) {
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const drag = useRef(null);
  const swiped = useRef(false);
  const offsetRef = useRef(0);
  const done = task.status === "completed";
  const detailsId = `task-${task.id}-details`;

  // A left swipe uncovers Delete. Small movements still count as taps.
  function onPointerDown(event) {
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
  }

  function onPointerMove(event) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    if (!drag.current.moved && Math.abs(dx) < 8) return;
    if (!drag.current.moved && Math.abs(dy) > Math.abs(dx)) return;

    if (!drag.current.moved) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Some browsers refuse capture for this pointer. The swipe still tracks.
      }
    }
    drag.current.moved = true;
    const base = open ? -DELETE_WIDTH : 0;
    const next = Math.max(-DELETE_WIDTH, Math.min(0, base + dx));
    offsetRef.current = next;
    setOffset(next);
  }

  function onPointerUp() {
    if (!drag.current) return;
    const moved = drag.current.moved;
    drag.current = null;
    if (!moved) return;
    swiped.current = true;

    if (offsetRef.current < -DELETE_WIDTH / 2) {
      setOpen(true);
      offsetRef.current = -DELETE_WIDTH;
      setOffset(-DELETE_WIDTH);
      return;
    }

    setOpen(false);
    offsetRef.current = 0;
    setOffset(0);
  }

  const timeLabel = task.endTime
    ? `${formatTime(task.startTime)} – ${formatTime(task.endTime)}`
    : formatTime(task.startTime);
  const priorityLabel = task.priority
    ? `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`
    : "No priority";
  const priorityClass =
    task.priority === "high"
      ? "bg-[#ffe6e7] text-[#090e23]"
      : task.priority === "medium"
        ? "bg-[#eff2ff] text-[#090e23]"
        : task.priority === "low"
          ? "border border-[#eaeaea] bg-white text-[#090e23]"
          : "";
  const accentPanelClass =
    task.priority === "high"
      ? "bg-[#ffe6e7]"
      : task.priority === "medium"
        ? "bg-[#eff2ff]"
        : task.priority === "low"
          ? "border border-[#eaeaea] bg-white"
          : "bg-[#f4f5f8]";

  return (
    <div className="relative mb-3 overflow-hidden rounded-2xl border border-[#eaeaea] bg-white shadow-[0_1px_2px_rgba(9,14,35,0.04)] transition-shadow lg:hover:shadow-[0_4px_14px_rgba(9,14,35,0.06)]">
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        onClick={() => onDeleteNow(task)}
        className="absolute inset-y-0 right-0 w-[88px] bg-[#ffe6e7] text-[14px] font-medium text-[#090e23]"
      >
        Delete
      </button>
      <div
        className="relative bg-white"
        style={{ transform: `translateX(${offset}px)` }}
        onClickCapture={(event) => {
          if (!swiped.current) return;
          swiped.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="flex items-start gap-3 p-4">
          <button
            type="button"
            role="checkbox"
            aria-checked={done}
            aria-label={done ? `Mark ${task.title} as in progress` : `Mark ${task.title} as completed`}
            onClick={() => onToggle(task.id)}
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-[#4566ec] bg-white"
          >
            {done ? <img src="/icons/check.svg" alt="" width={14} height={14} /> : null}
          </button>
          <button
            type="button"
            aria-expanded={detailsOpen}
            aria-controls={detailsId}
            onClick={() => setDetailsOpen((current) => !current)}
            className="min-w-0 flex-1 text-left"
          >
            <span className="block text-[11px] font-medium text-[#717171]">Title</span>
            <span
              className={`mt-0.5 block break-words text-[15px] font-medium leading-5 text-[#090e23] ${
                done ? "line-through" : ""
              }`}
            >
              {task.title}
            </span>
          </button>
          <button
            type="button"
            aria-label={`Delete ${task.title}`}
            onClick={() => onAskDelete(task)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg lg:hover:bg-[#f4f5f8]"
          >
            <img src="/icons/trash.svg" alt="" width={18} height={18} />
          </button>
          <button
            type="button"
            aria-label={`Edit ${task.title}`}
            onClick={() => onEdit(task)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg lg:hover:bg-[#f4f5f8]"
          >
            <img src="/icons/edit.svg" alt="" width={18} height={18} />
          </button>
        </div>
        {detailsOpen ? (
          <div id={detailsId} className="flex gap-3 px-4 pb-4 pl-12">
            <div className="min-w-0 flex-1 space-y-2.5">
              {task.description ? (
                <div>
                  <p className="text-[11px] font-medium text-[#717171]">Description</p>
                  <p className="mt-0.5 break-words text-[14px] leading-5 text-[#6e7180]">{task.description}</p>
                </div>
              ) : null}
              <div>
                <p className="text-[11px] font-medium text-[#717171]">Date</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#090e23]">
                  <img src="/icons/calendar.svg" alt="" width={14} height={14} />
                  <span className="min-w-0 break-words">
                    {formatTaskDate(task.date)} {task.date.slice(0, 4)}
                  </span>
                </p>
              </div>
              {timeLabel ? (
                <div>
                  <p className="text-[11px] font-medium text-[#717171]">Time</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#090e23]">
                    <img src="/icons/clock.svg" alt="" width={14} height={14} />
                    <span>{timeLabel}</span>
                  </p>
                </div>
              ) : null}
              {task.priority ? (
                <p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium ${priorityClass}`}>
                    {priorityLabel}
                  </span>
                </p>
              ) : null}
            </div>
            <div
              className={`hidden w-20 shrink-0 items-center justify-center rounded-xl p-2 sm:flex ${accentPanelClass}`}
              aria-hidden="true"
            >
              <img src="/illustrations/task-card-accent.svg" alt="" width={56} height={70} className="max-h-[70px] w-auto" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
