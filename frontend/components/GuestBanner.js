"use client";

// Shown only in guest demo mode to nudge users toward registration.
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function GuestBanner() {
  const { demo } = useAuth();
  if (!demo) return null;

  return (
    <p className="mb-4 text-[13px] leading-5 text-[#6e7180]">
      <span className="font-medium text-[#090e23]">Guest Demo.</span>{" "}
      <Link href="/register" className="font-medium text-[#4566ec]">
        Create an account to save your tasks permanently.
      </Link>
    </p>
  );
}
