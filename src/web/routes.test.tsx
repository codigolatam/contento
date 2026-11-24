import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "./routes";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

const urlOf = (input: unknown) =>
  typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;

const sessionResponse = (signedIn: boolean) =>
  new Response(JSON.stringify(signedIn ? { email: "ada@example.com" } : { error: "unauthorized" }), {
    status: signedIn ? 200 : 401,
    headers: { "content-type": "application/json" },
  });

const stubSession = (signedIn: boolean) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(sessionResponse(signedIn)));

describe("AppRoutes", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each([
    ["/", "Pipeline"],
    ["/pipeline", "Pipeline"],
    ["/series", "Series"],
    ["/piezas", "Piezas"],
    ["/otra-cosa", "Pipeline"],
  ])("renders %s as %s for a signed-in session", async (path, name) => {
    stubSession(true);
    renderAt(path);

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe(name);
  });

  it.each(["/", "/pipeline", "/series", "/piezas", "/otra-cosa"])(
    "redirects %s to the access screen without a session",
    async (path) => {
      stubSession(false);
      renderAt(path);

      expect(await screen.findByRole("button", { name: "Entrar" })).toBeDefined();
      expect(screen.queryByRole("link", { name: "Pipeline" })).toBeNull();
    },
  );

  it("consults /api/me to learn the session state", async () => {
    const fetchSpy = stubSession(false);
    renderAt("/pipeline");

    await screen.findByRole("button", { name: "Entrar" });
    expect(fetchSpy.mock.calls.some(([input]) => urlOf(input) === "/api/me")).toBe(true);
  });

  it("shows neither the surface nor the access screen while the session check is pending", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => new Promise<Response>(() => undefined));
    renderAt("/pipeline");

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("button", { name: "Entrar" })).toBeNull();
  });

  it("treats a failed session check as anonymous and redirects to the access screen", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("network down"));
    renderAt("/pipeline");

    expect(await screen.findByRole("button", { name: "Entrar" })).toBeDefined();
  });

  it.each(["/login", "/registro"])(
    "redirects a signed-in visitor away from %s",
    async (path) => {
      stubSession(true);
      renderAt(path);

      const heading = await screen.findByRole("heading", { level: 1, name: "Pipeline" });
      expect(heading).toBeDefined();
    },
  );

  it("links the three surfaces in the sidebar and marks the active section", async () => {
    stubSession(true);
    renderAt("/series");

    const nav = await screen.findByRole("navigation", { name: "Secciones" });
    const links = { Pipeline: "/pipeline", Series: "/series", Piezas: "/piezas" };
    for (const [name, href] of Object.entries(links)) {
      const link = await screen.findByRole("link", { name });
      expect(nav.contains(link)).toBe(true);
      expect(link.getAttribute("href")).toBe(href);
    }
    expect(screen.getByRole("link", { name: "Series" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Pipeline" }).getAttribute("aria-current")).toBeNull();
  });

  it("shows the product name and the reserved workspace slot in the header", async () => {
    stubSession(true);
    renderAt("/pipeline");

    expect(await screen.findByText("Contento")).toBeDefined();
    expect(screen.getByText("Workspace")).toBeDefined();
  });

  it("signs out through /api/auth/sign-out and returns to the access screen", async () => {
    let signedIn = true;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      if (urlOf(input) === "/api/auth/sign-out") {
        signedIn = false;
      }
      return Promise.resolve(sessionResponse(signedIn));
    });
    renderAt("/pipeline");
    await screen.findByRole("heading", { level: 1 });

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(await screen.findByRole("button", { name: "Entrar" })).toBeDefined();
    const signOutCall = fetchSpy.mock.calls.find(([input]) => urlOf(input) === "/api/auth/sign-out");
    expect(signOutCall?.[1]?.method).toBe("POST");
  });

  it("disables the sign-out action and declares the process while it runs", async () => {
    let resolveSignOut: (response: Response) => void = () => undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      if (urlOf(input) === "/api/auth/sign-out") {
        return new Promise<Response>((resolve) => {
          resolveSignOut = resolve;
        });
      }
      return Promise.resolve(sessionResponse(true));
    });
    renderAt("/pipeline");
    await screen.findByRole("heading", { level: 1 });

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    const pending = await screen.findByRole("button", { name: "Saliendo…" });
    expect((pending as HTMLButtonElement).disabled).toBe(true);
    resolveSignOut(sessionResponse(true));
  });

  it("keeps the surfaces reachable when the sign-out request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      if (urlOf(input) === "/api/auth/sign-out") {
        return Promise.reject(new TypeError("network down"));
      }
      return Promise.resolve(sessionResponse(true));
    });
    renderAt("/pipeline");
    await screen.findByRole("heading", { level: 1 });

    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    const heading = await screen.findByRole("heading", { level: 1, name: "Pipeline" });
    expect(heading).toBeDefined();
  });
});
