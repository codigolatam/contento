import { NavLink, Outlet } from "react-router";

export function Layout() {
  return (
    <div>
      <header className="app-header">
        <p className="product-name">Contento</p>
        <p className="workspace-slot">Workspace</p>
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
