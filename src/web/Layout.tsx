import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";

export function Layout() {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }).catch(() => null);
    setSigningOut(false);
    void navigate("/login", { replace: true });
  };

  return (
    <div>
      <header className="app-header">
        <p className="product-name">Contento</p>
        <div className="header-side">
          <p className="workspace-slot">Workspace</p>
          <button
            className="secondary-action"
            type="button"
            disabled={signingOut}
            onClick={() => {
              void signOut();
            }}
          >
            {signingOut ? "Saliendo…" : "Salir"}
          </button>
        </div>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <nav aria-label="Secciones">
            <ul>
              <li>
                <NavLink to="/pipeline">Pipeline</NavLink>
              </li>
              <li>
                <NavLink to="/series">Series</NavLink>
              </li>
              <li>
                <NavLink to="/piezas">Piezas</NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
