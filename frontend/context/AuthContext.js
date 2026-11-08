"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "@/lib/api";
import { DEMO_KEY } from "@/lib/demoTasks";

const AuthContext = createContext(null);

function readDemoFlag() {
  return sessionStorage.getItem(DEMO_KEY) === "1";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demo, setDemo] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let ignore = false;

    api
      .getMe()
      .then((current) => {
        if (ignore) return;
        setUser(current);
        if (current) {
          sessionStorage.removeItem(DEMO_KEY);
          setDemo(false);
        } else {
          setDemo(readDemoFlag());
        }
      })
      .catch(() => {
        if (ignore) return;
        setUser(null);
        setDemo(readDemoFlag());
      })
      .finally(() => {
        if (!ignore) setReady(true);
      });

    function onExpired() {
      setUser(null);
    }

    window.addEventListener("auth:expired", onExpired);
    return () => {
      ignore = true;
      window.removeEventListener("auth:expired", onExpired);
    };
  }, []);

  const clearDemo = useCallback(() => {
    sessionStorage.removeItem(DEMO_KEY);
    setDemo(false);
  }, []);

  const startDemo = useCallback(() => {
    sessionStorage.setItem(DEMO_KEY, "1");
    setDemo(true);
  }, []);

  const value = useMemo(
    () => ({
      user,
      demo,
      ready,
      startDemo,
      clearDemo,
      async login(input) {
        const next = await api.login(input);
        sessionStorage.removeItem(DEMO_KEY);
        setDemo(false);
        setUser(next);
        return next;
      },
      async register(input) {
        const next = await api.register(input);
        sessionStorage.removeItem(DEMO_KEY);
        setDemo(false);
        setUser(next);
        return next;
      },
      async logout() {
        await api.logout();
        setUser(null);
      },
    }),
    [user, demo, ready, startDemo, clearDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
