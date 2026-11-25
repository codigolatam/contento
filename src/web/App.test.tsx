import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { resetSessionStore, stubSession } from "./testing/fake-api";

describe("App", () => {
  afterEach(() => {
    cleanup();
    resetSessionStore();
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
