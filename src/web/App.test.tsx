import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the product name in the header", async () => {
    render(<App />);

    expect(await screen.findByText("Contento")).toBeDefined();
  });

  it("renders the pipeline surface as the landing view", async () => {
    render(<App />);

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Pipeline");
  });
});
