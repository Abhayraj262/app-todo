"use client";

import { useEffect, useRef } from "react";

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-[640px] bg-white p-6"
      >
        <h2 id="confirm-title" className="text-[18px] font-medium text-[#090e23]">
          {title}
        </h2>
        <p className="mt-2 text-[14px] text-[#717171]">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 border border-[#eaeaea] text-[16px] font-medium text-[#090e23]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 flex-1 bg-[#4566ec] text-[16px] font-medium text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
