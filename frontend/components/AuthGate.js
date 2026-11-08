"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SEEN_KEY } from "@/components/Onboarding";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export default function AuthGate({ children }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (!ready) return;
    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }
    if (user && isPublic) {
      const seen = localStorage.getItem(SEEN_KEY) === "1";
      router.replace(seen ? "/home" : "/");
    }
  }, [ready, user, isPublic, router]);

  if (!ready) {
    return <p className="px-6 pt-10 text-center text-[14px] text-[#6e7180]">Loading...</p>;
  }
  if (!user && !isPublic) return null;
  if (user && isPublic) return null;
  return children;
}
