import { Navigate, Route, Routes } from "react-router";
import { Access } from "./Access";
import { Layout } from "./Layout";
import { RequireAnon, RequireSession } from "./session";

interface SurfaceProps {
  name: string;
}

function Surface({ name }: SurfaceProps) {
  return (
    <section className="surface">
      <h1>{name}</h1>
    </section>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <RequireAnon>
            <Access key="sign-in" mode="sign-in" />
          </RequireAnon>
        }
      />
      <Route
        path="registro"
        element={
          <RequireAnon>
            <Access key="sign-up" mode="sign-up" />
          </RequireAnon>
        }
      />
      <Route
        element={
          <RequireSession>
            <Layout />
          </RequireSession>
        }
      >
        <Route index element={<Navigate to="/pipeline" replace />} />
        <Route path="pipeline" element={<Surface name="Pipeline" />} />
        <Route path="series" element={<Surface name="Series" />} />
        <Route path="piezas" element={<Surface name="Piezas" />} />
        <Route path="*" element={<Navigate to="/pipeline" replace />} />
      </Route>
    </Routes>
  );
}
