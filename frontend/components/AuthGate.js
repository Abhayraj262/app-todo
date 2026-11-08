"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SEEN_KEY } from "@/components/Onboarding";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export default function AuthGate({ children }) {
  const { user, demo, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.has(pathname);
  const demoAllowed = demo && (pathname === "/home" || pathname === "/search");

  useEffect(() => {
    if (!ready) return;
    if (user && isPublic) {
      const seen = localStorage.getItem(SEEN_KEY) === "1";
      router.replace(seen ? "/home" : "/");
      return;
    }
    if (!user && demo && pathname === "/") {
      router.replace("/home");
      return;
    }
    if (!user && !isPublic && !demoAllowed) {
      router.replace("/login");
    }
  }, [ready, user, demo, isPublic, demoAllowed, pathname, router]);

  if (!ready) {
    return <p className="px-6 pt-10 text-center text-[14px] text-[#6e7180]">Loading...</p>;
  }
  if (user && isPublic) return null;
  if (!user && !isPublic && !demoAllowed) return null;
  return children;
}
