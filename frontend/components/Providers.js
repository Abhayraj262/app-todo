"use client";

// Wraps the app with auth + tasks. TasksProvider remounts when user id changes so lists do not leak between accounts.
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TasksProvider } from "@/context/TasksContext";
import AuthGate from "@/components/AuthGate";

function Shell({ children }) {
  const { user } = useAuth();

  return (
    <TasksProvider key={user?.id || "guest"}>
      <AuthGate>
        <div className="mx-auto min-h-dvh w-full max-w-[640px] lg:max-w-[1120px]">{children}</div>
      </AuthGate>
    </TasksProvider>
  );
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  );
}
