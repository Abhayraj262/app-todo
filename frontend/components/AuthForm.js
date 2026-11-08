"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SEEN_KEY } from "@/components/Onboarding";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignInIcon() {
  return (
    <span className="flex size-12 items-center justify-center rounded-2xl border border-[#eceff3] bg-white text-[#111]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M13 12H3m0 0 3-3m-3 3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[#9aa0ab]">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[#9aa0ab]">
      <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeIcon({ off }) {
  if (off) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 4 20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9.5 9.7A4 4 0 0 0 14.3 14.5M7.2 7.4C5.2 8.6 3.7 10.4 3 12c1.6 3.6 5 6 9 6 1.5 0 2.9-.3 4.2-.9M10.2 6.2A9 9 0 0 1 12 6c4 0 7.4 2.4 9 6-.4.9-1 1.8-1.7 2.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12c1.6-3.6 5-6 9-6s7.4 2.4 9 6c-1.6 3.6-5 6-9 6s-7.4-2.4-9-6Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function AuthForm({ mode }) {
  const isLogin = mode === "login";
  const { login, register, startDemo } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextEmail = email.trim().toLowerCase();
    if (!emailPattern.test(nextEmail)) {
      setError("Enter a valid email.");
      return;
    }
    if (!isLogin && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!password) {
      setError("Email or password is incorrect.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (isLogin) await login({ email: nextEmail, password });
      else await register({ email: nextEmail, password });
      const seen = localStorage.getItem(SEEN_KEY) === "1";
      router.push(seen ? "/home" : "/");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="fixed inset-0 z-20 flex items-center justify-center overflow-y-auto bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{ backgroundImage: "url(/login-clouds.jpg)" }}
    >
      <div className="w-full max-w-[400px] rounded-[28px] border border-white/80 bg-white/95 px-7 py-9 shadow-[0_24px_60px_rgba(80,130,180,0.18)] sm:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="text-[13px] font-medium tracking-[0.08em] text-[#6e7180]">To-Do</p>
          <div className="mt-4">
            <SignInIcon />
          </div>
          <h1 className="mt-5 text-[22px] font-semibold text-[#111111]">
            {isLogin ? "Sign in with email." : "Create your account."}
          </h1>
          <p className="mt-2 max-w-[280px] text-[13px] leading-5 text-[#8b909a]">
            {isLogin
              ? "Use your email and password to open your tasks."
              : "Email and password are enough to get started."}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-7 space-y-3.5" noValidate>
          <label className="block">
            <span className="sr-only">Email</span>
            <span className="flex h-12 items-center gap-2.5 rounded-xl border border-[#e6e8ee] bg-white px-3.5">
              <MailIcon />
              <input
                type="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[16px] text-[#111111] outline-none placeholder:text-[#9aa0ab]"
              />
            </span>
          </label>
          <label className="block">
            <span className="sr-only">Password</span>
            <span className="flex h-12 items-center gap-2.5 rounded-xl border border-[#e6e8ee] bg-white px-3.5">
              <LockIcon />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[16px] text-[#111111] outline-none placeholder:text-[#9aa0ab]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-[#9aa0ab]"
              >
                <EyeIcon off={showPassword} />
              </button>
            </span>
          </label>
          {error ? <p className="bg-[#ffe6e7] px-2 py-1 text-[12px] text-[#090e23]">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 h-12 w-full rounded-full bg-[#111111] text-[16px] font-medium text-white disabled:opacity-70"
          >
            {submitting ? "Please wait..." : isLogin ? "Log in" : "Create account"}
          </button>
          {isLogin ? (
            <button
              type="button"
              onClick={() => {
                startDemo();
                router.push("/home");
              }}
              className="h-12 w-full rounded-full border border-[#111111] text-[16px] font-medium text-[#111111]"
            >
              Explore as Guest
            </button>
          ) : null}
        </form>
        <p className="mt-6 text-center text-[14px] text-[#8b909a]">
          {isLogin ? "Need an account? " : "Already have an account? "}
          <Link href={isLogin ? "/register" : "/login"} className="font-medium text-[#111111]">
            {isLogin ? "Register" : "Log in"}
          </Link>
        </p>
      </div>
    </main>
  );
}
