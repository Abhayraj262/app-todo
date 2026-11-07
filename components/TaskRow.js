"use client";

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

  return (
    <div className="relative overflow-hidden">
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
        className="relative bg-[#fdfdff]"
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
        <div className="flex items-start gap-3 py-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={done}
            aria-label={done ? `Mark ${task.title} as in progress` : `Mark ${task.title} as completed`}
            onClick={() => onToggle(task.id)}
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-white outline outline-1 outline-[#4566ec]"
          >
            {done ? <img src="/icons/check.svg" alt="" width={20} height={20} /> : null}
          </button>
          <button
            type="button"
            aria-expanded={detailsOpen}
            aria-controls={detailsId}
            onClick={() => setDetailsOpen((current) => !current)}
            className={`min-w-0 flex-1 text-left text-[14px] font-medium text-[#090e23] ${
              done ? "line-through" : ""
            }`}
          >
            {task.title}
          </button>
          <button
            type="button"
            aria-label={`Delete ${task.title}`}
            onClick={() => onAskDelete(task)}
            className="shrink-0"
          >
            <img src="/icons/trash.svg" alt="" width={24} height={24} />
          </button>
          <button
            type="button"
            aria-label={`Edit ${task.title}`}
            onClick={() => onEdit(task)}
            className="shrink-0"
          >
            <img src="/icons/edit.svg" alt="" width={24} height={24} />
          </button>
        </div>
        {detailsOpen ? (
          <div id={detailsId} className="pb-3 pl-8 text-[12px] leading-5 text-[#717171]">
            <p>{task.description || "No description"}</p>
            <p>
              {formatTaskDate(task.date)}
              {timeLabel ? ` · ${timeLabel}` : ""}
            </p>
            <p>{priorityLabel}</p>
          </div>
        ) : null}
        <div className="ml-8 border-b border-[#e6e6e6]" />
      </div>
    </div>
  );
}
