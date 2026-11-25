import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { authClient } from "./auth-client";

export function Layout() {
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await authClient.signOut().catch(() => null);
    setSigningOut(false);
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
