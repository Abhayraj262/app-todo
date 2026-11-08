"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let ignore = false;

    api
      .getMe()
      .then((current) => {
        if (!ignore) setUser(current);
      })
      .catch(() => {
        if (!ignore) setUser(null);
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

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(input) {
        const next = await api.login(input);
        setUser(next);
        return next;
      },
      async register(input) {
        const next = await api.register(input);
        setUser(next);
        return next;
      },
      async logout() {
        await api.logout();
        setUser(null);
      },
    }),
    [user, ready],
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
