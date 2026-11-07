"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

const SEEN_KEY = "todo-seen-onboarding";

function subscribe() {
  return () => {};
}

function readPhase() {
  return localStorage.getItem(SEEN_KEY) === "1" ? "seen" : "new";
}

export default function Onboarding() {
  const router = useRouter();
  const phase = useSyncExternalStore(subscribe, readPhase, () => "pending");

  useEffect(() => {
    if (phase === "seen") router.replace("/home");
  }, [phase, router]);

  function start() {
    localStorage.setItem(SEEN_KEY, "1");
    router.push("/home");
  }

  if (phase !== "new") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#4566ec] text-[14px] text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#4566ec]">
      <div className="relative min-h-[360px] flex-1 overflow-hidden">
        <img
          src="/icons/chevron.svg"
          alt=""
          width={118}
          height={151}
          className="absolute left-[-44px] top-12 rotate-[46deg]"
        />
        <img
          src="/icons/chevron.svg"
          alt=""
          width={118}
          height={151}
          className="absolute right-[-28px] bottom-8 rotate-[46deg]"
        />
        <img
          src="/icons/ring.svg"
          alt=""
          width={88}
          height={88}
          className="absolute -top-8 right-[-8px]"
        />
      </div>
      <section className="flex min-h-[292px] flex-col bg-white px-6 pt-6 pb-8">
        <h1 className="text-[24px] font-semibold text-black">Manage What To Do</h1>
        <p className="mt-4 max-w-[307px] text-[12px] leading-normal text-[#717171]">
          The best way to manage what you have to do, don&apos;t forget your plans
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-auto h-12 w-full bg-[#4566ec] text-[16px] font-medium text-white"
        >
          Get Started
        </button>
      </section>
    </main>
  );
}
