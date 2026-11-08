"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function GuestNotice({ onClose }) {
  const { clearDemo } = useAuth();
  const router = useRouter();

  function leave(path) {
    clearDemo();
    router.push(path);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="guest-title" className="w-full max-w-[640px] bg-white p-6">
        <h2 id="guest-title" className="text-[18px] font-medium text-[#090e23]">
          This is a demo
        </h2>
        <p className="mt-2 text-[14px] text-[#717171]">Please log in or create an account to use this feature.</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 border border-[#eaeaea] text-[16px] font-medium text-[#090e23]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => leave("/register")}
            className="h-12 flex-1 border border-[#111111] text-[16px] font-medium text-[#111111]"
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => leave("/login")}
            className="h-12 flex-1 bg-[#111111] text-[16px] font-medium text-white"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export function useGuestLock() {
  const { demo } = useAuth();
  const [open, setOpen] = useState(false);
  const guard = useCallback(() => {
    if (!demo) return false;
    setOpen(true);
    return true;
  }, [demo]);

  return {
    guard,
    notice: open ? <GuestNotice onClose={() => setOpen(false)} /> : null,
  };
}
