import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

const sessionResponse = (signedIn: boolean) =>
  new Response(JSON.stringify(signedIn ? { email: "ada@example.com" } : { error: "unauthorized" }), {
    status: signedIn ? 200 : 401,
    headers: { "content-type": "application/json" },
  });

const stubSession = (signedIn: boolean) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(sessionResponse(signedIn)));

describe("App", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows the product name in the header", async () => {
    stubSession(true);
    render(<App />);

    expect(await screen.findByText("Contento")).toBeDefined();
  });

  it("renders the pipeline surface as the landing view", async () => {
    stubSession(true);
    render(<App />);

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Pipeline");
  });

  it("shows the access screen without a session", async () => {
    stubSession(false);
    render(<App />);

    expect(await screen.findByRole("button", { name: "Entrar" })).toBeDefined();
  });
});
