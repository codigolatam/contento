import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { authClient } from "./auth-client";

type SessionState = "checking" | "signed-in" | "anonymous";

const useSessionState = (): SessionState => {
  const { data, isPending } = authClient.useSession();
  if (isPending) return "checking";
  return data === null ? "anonymous" : "signed-in";
};

interface GuardProps {
  children: ReactNode;
}

export function RequireSession({ children }: GuardProps) {
  const state = useSessionState();
  const location = useLocation();
  if (state === "checking") return null;
  if (state === "anonymous") {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  return children;
}

export function RequireAnon({ children }: GuardProps) {
  const state = useSessionState();
  const location = useLocation();
  if (state === "signed-in") {
    const from = (location.state as { from?: unknown } | null)?.from;
    const valid = typeof from === "string" && from.startsWith("/") && !from.startsWith("//");
    return <Navigate to={valid ? from : "/pipeline"} replace />;
  }
  return children;
}
