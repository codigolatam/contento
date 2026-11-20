import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./Layout";

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
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/pipeline" replace />} />
        <Route path="pipeline" element={<Surface name="Pipeline" />} />
        <Route path="series" element={<Surface name="Series" />} />
        <Route path="piezas" element={<Surface name="Piezas" />} />
        <Route path="*" element={<Navigate to="/pipeline" replace />} />
      </Route>
    </Routes>
  );
}
