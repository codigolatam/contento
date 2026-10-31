import { screen } from "@testing-library/react";
import type { Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const mountedRoots = vi.hoisted(() => [] as Root[]);

vi.mock("react-dom/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom/client")>();
  return {
    ...actual,
    createRoot: (container: Element) => {
      const root = actual.createRoot(container);
      mountedRoots.push(root);
      return root;
    },
  };
});

const loadMain = () => import("./main");

describe("main entry", () => {
  afterEach(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    document.body.innerHTML = "";
    vi.resetModules();
  });

  it("mounts the app inside the #root element", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await loadMain();

    expect(mountedRoots).toHaveLength(1);
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Contento");
    expect(document.getElementById("root")?.contains(heading)).toBe(true);
  });

  it("throws a clear error when #root is missing", async () => {
    await expect(loadMain()).rejects.toThrow("Missing #root element in index.html");
  });
});
