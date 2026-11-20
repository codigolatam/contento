import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "./routes";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

describe("AppRoutes", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each(["/", "/otra-cosa"])("redirects %s to the pipeline surface", async (path) => {
    renderAt(path);

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Pipeline");
  });

  it.each([
    ["/pipeline", "Pipeline"],
    ["/series", "Series"],
    ["/piezas", "Piezas"],
  ])("renders %s identified by its surface heading", async (path, name) => {
    renderAt(path);

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe(name);
  });

  it("links the three surfaces in the sidebar and marks the active section", async () => {
    renderAt("/series");

    const nav = screen.getByRole("navigation", { name: "Secciones" });
    const links = { Pipeline: "/pipeline", Series: "/series", Piezas: "/piezas" };
    for (const [name, href] of Object.entries(links)) {
      const link = await screen.findByRole("link", { name });
      expect(nav.contains(link)).toBe(true);
      expect(link.getAttribute("href")).toBe(href);
    }
    expect(screen.getByRole("link", { name: "Series" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Pipeline" }).getAttribute("aria-current")).toBeNull();
  });

  it("shows the product name and the reserved workspace slot in the header", () => {
    renderAt("/pipeline");

    expect(screen.getByText("Contento")).toBeDefined();
    expect(screen.getByText("Workspace")).toBeDefined();
  });

  it("performs no network calls when rendering any surface", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    for (const path of ["/pipeline", "/series", "/piezas"]) {
      cleanup();
      renderAt(path);
      await screen.findByRole("heading", { level: 1 });
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
