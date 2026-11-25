import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { field } from "./Access";
import { AppRoutes } from "./routes";
import { json, pathOf, refreshSession, resetSessionStore, sessionResponse } from "./testing/fake-api";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

const formOf = (container: HTMLElement): HTMLFormElement => {
  const form = container.querySelector("form");
  if (form === null) throw new Error("access form not found");
  return form;
};

interface StubOverrides {
  signInStatus?: number;
  signUpResponse?: { status: number; body: unknown };
}

const stubApi = (overrides: StubOverrides = {}) => {
  const state = { signedIn: false };
  const calls: { path: string; init?: RequestInit }[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const path = pathOf(input);
    calls.push({ path, init });
    if (path === "/api/auth/get-session") {
      return Promise.resolve(sessionResponse(state.signedIn));
    }
    if (path === "/api/auth/sign-in/email") {
      const status = overrides.signInStatus ?? 200;
      if (status === 200) state.signedIn = true;
      return Promise.resolve(json({}, status));
    }
    if (path === "/api/auth/sign-up/email") {
      const signUp = overrides.signUpResponse ?? { status: 200, body: {} };
      if (signUp.status === 200) state.signedIn = true;
      return Promise.resolve(json(signUp.body, signUp.status));
    }
    return Promise.resolve(json({ error: "not found" }, 404));
  });
  refreshSession();
  return { state, calls };
};

const jsonBody = (request: { path: string; init?: RequestInit } | undefined): unknown => {
  if (typeof request?.init?.body !== "string") throw new Error("expected a string JSON body");
  return JSON.parse(request.init.body);
};

const fillField = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const fillSignIn = () => {
  fillField("Correo", "ada@example.com");
  fillField("Contraseña", "password123");
};

const fillSignUp = () => {
  fillField("Nombre", "Ada");
  fillSignIn();
};

describe("Access", () => {
  afterEach(() => {
    cleanup();
    resetSessionStore();
    vi.restoreAllMocks();
  });

  it("reads form values as strings and defaults missing ones to empty", () => {
    const data = new FormData();
    expect(field(data, "email")).toBe("");
    data.set("email", "ada@example.com");
    expect(field(data, "email")).toBe("ada@example.com");
  });

  it("shows the sign-in form in Spanish for an anonymous visitor", async () => {
    stubApi();
    renderAt("/login");

    expect(await screen.findByRole("heading", { level: 1, name: "Entrar" })).toBeDefined();
    expect(screen.getByLabelText("Correo")).toBeDefined();
    expect(screen.getByLabelText("Contraseña")).toBeDefined();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Crear una cuenta" }).getAttribute("href")).toBe(
      "/registro",
    );
    expect(document.activeElement).toBe(screen.getByLabelText("Correo"));
    expect(document.title).toBe("Entrar · Contento");
  });

  it("shows the create-account form at /registro asking for a name", async () => {
    stubApi();
    renderAt("/registro");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Crear cuenta" }),
    ).toBeDefined();
    expect(screen.getByLabelText("Nombre")).toBeDefined();
    expect(screen.getByLabelText("Correo")).toBeDefined();
    expect(screen.getByLabelText("Contraseña")).toBeDefined();
    expect(screen.getByText("Mínimo 8 caracteres.")).toBeDefined();
    expect(screen.getByLabelText("Contraseña").getAttribute("aria-describedby")).toBe(
      "password-hint",
    );
    expect(screen.getByRole("link", { name: "Ya tengo cuenta" }).getAttribute("href")).toBe(
      "/login",
    );
    expect(document.activeElement).toBe(screen.getByLabelText("Nombre"));
    expect(document.title).toBe("Crear cuenta · Contento");
  });

  it("navigates between the two access purposes by links", async () => {
    stubApi();
    renderAt("/login");
    fireEvent.click(await screen.findByRole("link", { name: "Crear una cuenta" }));

    await screen.findByRole("heading", { level: 1, name: "Crear cuenta" });
    fireEvent.click(screen.getByRole("link", { name: "Ya tengo cuenta" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Entrar" })).toBeDefined();
  });

  it("signs in through /api/auth/sign-in/email and lands on the surface", async () => {
    const { calls } = stubApi();
    renderAt("/login");
    await screen.findByLabelText("Correo");

    fillSignIn();
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Pipeline" })).toBeDefined();
    const request = calls.find((c) => c.path === "/api/auth/sign-in/email");
    expect(request?.init?.method).toBe("POST");
    expect(new Headers(request?.init?.headers).get("content-type")).toBe("application/json");
    expect(jsonBody(request)).toEqual({
      email: "ada@example.com",
      password: "password123",
    });
  });

  it("disables the submit and declares the process while the request is in flight", async () => {
    let resolveSignIn: (response: Response) => void = () => undefined;
    const state = { signedIn: false };
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const path = pathOf(input);
      if (path === "/api/auth/sign-in/email") {
        return new Promise<Response>((resolve) => {
          resolveSignIn = (response) => {
            state.signedIn = true;
            resolve(response);
          };
        });
      }
      if (path === "/api/auth/get-session") {
        return sessionResponse(state.signedIn);
      }
      return json({ error: "not found" }, 404);
    });
    refreshSession();
    renderAt("/login");
    await screen.findByLabelText("Correo");

    fillSignIn();
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const pending = await screen.findByRole("button", { name: "Entrando…" });
    expect((pending as HTMLButtonElement).disabled).toBe(true);
    resolveSignIn(json({}, 200));
    expect(await screen.findByRole("heading", { level: 1, name: "Pipeline" })).toBeDefined();
  });

  it("shows a generic credential error and stays on the form when sign-in is rejected", async () => {
    stubApi({ signInStatus: 401 });
    renderAt("/login");
    await screen.findByLabelText("Correo");

    fillSignIn();
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Correo o contraseña incorrectos.");
    expect(screen.getByLabelText("Correo").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Contraseña").getAttribute("aria-describedby")).toBe(
      alert.id,
    );
    expect(screen.getByLabelText("Correo")).toBeDefined();
  });

  it("shows the service error when sign-in answers with a server error", async () => {
    stubApi({ signInStatus: 503 });
    renderAt("/login");
    await screen.findByLabelText("Correo");

    fillSignIn();
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("No se pudo conectar con el servicio. Inténtalo de nuevo.");
    expect(screen.getByLabelText("Correo")).toBeDefined();
  });

  it("shows the service error when sign-in is rejected for another reason", async () => {
    stubApi({ signInStatus: 429 });
    renderAt("/login");
    await screen.findByLabelText("Correo");

    fillSignIn();
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("No se pudo conectar con el servicio. Inténtalo de nuevo.");
    expect(screen.getByLabelText("Correo")).toBeDefined();
  });

  it("re-announces the error when a repeated submit gets the same rejection", async () => {
    stubApi({ signInStatus: 401 });
    renderAt("/login");
    await screen.findByLabelText("Correo");

    fillSignIn();
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    const first = await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).not.toBe(first);
    });
  });

  it("shows the network error when the sign-in request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const path = pathOf(input);
      if (path === "/api/auth/sign-in/email") {
        return Promise.reject(new TypeError("network down"));
      }
      if (path === "/api/auth/get-session") return Promise.resolve(sessionResponse(false));
      return Promise.resolve(json({ error: "not found" }, 404));
    });
    refreshSession();
    renderAt("/login");
    await screen.findByLabelText("Correo");

    fillSignIn();
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("No se pudo conectar con el servicio. Inténtalo de nuevo.");
    expect(screen.getByLabelText("Correo")).toBeDefined();
  });

  it.each<{ fields: Record<string, string>; when: string }>([
    { fields: {}, when: "with no fields filled" },
    { fields: { Correo: "ada@example.com" }, when: "with only the email filled" },
    { fields: { Contraseña: "password123" }, when: "with only the password filled" },
  ])("does not call the service when submitting $when", async ({ fields }) => {
    const { calls } = stubApi();
    const { container } = renderAt("/login");
    await screen.findByLabelText("Correo");

    for (const [label, value] of Object.entries(fields)) fillField(label, value);
    fireEvent.submit(formOf(container));

    expect(calls.some((c) => c.path === "/api/auth/sign-in/email")).toBe(false);
  });

  it("does not call the service when signing up without a name", async () => {
    const { calls } = stubApi();
    const { container } = renderAt("/registro");
    await screen.findByLabelText("Nombre");

    fillSignIn();
    fireEvent.submit(formOf(container));

    expect(calls.some((c) => c.path === "/api/auth/sign-up/email")).toBe(false);
  });

  it("returns to the route that asked for a session after signing in", async () => {
    stubApi();
    renderAt("/piezas");
    await screen.findByLabelText("Correo");

    fillSignIn();
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Piezas" })).toBeDefined();
  });

  it("keeps the return route when moving from sign-in to sign-up", async () => {
    stubApi();
    renderAt("/piezas");
    fireEvent.click(await screen.findByRole("link", { name: "Crear una cuenta" }));
    await screen.findByLabelText("Nombre");

    fillSignUp();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Piezas" })).toBeDefined();
  });

  it("signs up through /api/auth/sign-up/email and lands on the surface", async () => {
    const { calls } = stubApi();
    renderAt("/registro");
    await screen.findByLabelText("Nombre");

    fillSignUp();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Pipeline" })).toBeDefined();
    const request = calls.find((c) => c.path === "/api/auth/sign-up/email");
    expect(request?.init?.method).toBe("POST");
    expect(jsonBody(request)).toEqual({
      name: "Ada",
      email: "ada@example.com",
      password: "password123",
    });
  });

  it("reports the taken email when sign-up answers the account already exists", async () => {
    stubApi({ signUpResponse: { status: 422, body: { code: "USER_ALREADY_EXISTS" } } });
    renderAt("/registro");
    await screen.findByLabelText("Nombre");

    fillSignUp();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Ya existe una cuenta con ese correo.");
    expect(screen.getByLabelText("Correo").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Correo").getAttribute("aria-describedby")).toBe(alert.id);
    expect(screen.getByLabelText("Contraseña").getAttribute("aria-describedby")).toBe(
      "password-hint",
    );
  });

  it("reports the short password when sign-up answers the password is too short", async () => {
    stubApi({ signUpResponse: { status: 400, body: { code: "PASSWORD_TOO_SHORT" } } });
    renderAt("/registro");
    await screen.findByLabelText("Nombre");

    fillField("Nombre", "Ada");
    fillField("Correo", "ada@example.com");
    fillField("Contraseña", "short");
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("La contraseña debe tener al menos 8 caracteres.");
    expect(screen.getByLabelText("Contraseña").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Contraseña").getAttribute("aria-describedby")).toBe(
      `password-hint ${alert.id}`,
    );
    expect(screen.getByLabelText("Correo").getAttribute("aria-describedby")).toBeNull();
  });

  it.each([
    { body: { code: "OTHER_ERROR" }, when: "an unrelated error code" },
    { body: { code: 42 }, when: "a non-string error code" },
    { body: {}, when: "a payload without code" },
    { body: "oops", when: "a non-object payload" },
    { body: undefined, when: "an empty body" },
  ])("shows the generic sign-up error for $when", async ({ body }) => {
    stubApi({ signUpResponse: { status: 400, body } });
    renderAt("/registro");
    await screen.findByLabelText("Nombre");

    fillSignUp();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("No se pudo crear la cuenta. Inténtalo de nuevo.");
  });
});
