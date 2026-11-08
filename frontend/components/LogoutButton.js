"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await logout();
      router.replace("/login");
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-[14px] font-medium text-[#4566ec] disabled:opacity-70"
    >
      {pending ? "Logging out..." : "Log out"}
    </button>
  );
}
