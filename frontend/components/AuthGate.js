"use client";

// Client-side route guard: login/register are public; guest users may only use /home and /search.
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

  const showPage = isPublic || (ready && (Boolean(user) || demoAllowed));

  // The page segment has to stay mounted. Swapping it for a loading line drops
  // the route, and Next.js then cannot validate instant navigation.
  return (
    <>
      {showPage ? null : <p className="px-6 pt-10 text-center text-[14px] text-[#6e7180]">Loading...</p>}
      <div className={showPage ? "contents" : "hidden"}>{children}</div>
    </>
  );
}
