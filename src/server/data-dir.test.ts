import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { resolveDataDir } from "./data-dir";

const repoDir = (name: string) =>
  fileURLToPath(new URL(`../../${name}`, import.meta.url));

describe("resolveDataDir", () => {
  it("returns PGLITE_DATA_DIR when it is set", () => {
    expect(resolveDataDir({ PGLITE_DATA_DIR: "/tmp/data", NODE_ENV: "test" })).toBe(
      "/tmp/data",
    );
  });

  it("returns the repo test data directory under NODE_ENV=test", () => {
    expect(resolveDataDir({ NODE_ENV: "test" })).toBe(repoDir(".pglite-data-test"));
  });

  it.each([{ NODE_ENV: "development" }, {}])(
    "returns the repo data directory outside tests (%j)",
    (env) => {
      expect(resolveDataDir(env)).toBe(repoDir(".pglite-data"));
    },
  );
});
