import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

const checkSession = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/me");
    return response.ok;
  } catch {
    return false;
  }
};

type SessionState = "checking" | "signed-in" | "anonymous";

const useSessionState = (): SessionState => {
  const [state, setState] = useState<SessionState>("checking");
  useEffect(() => {
    void checkSession().then((signedIn) => {
      setState(signedIn ? "signed-in" : "anonymous");
    });
  }, []);
  return state;
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
  if (state === "signed-in") return <Navigate to="/pipeline" replace />;
  return children;
}
