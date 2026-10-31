import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serveMock = vi.hoisted(() => vi.fn());

vi.mock("@hono/node-server", () => ({ serve: serveMock }));

const loadServer = () => import("./server");

describe("server entrypoint", () => {
  beforeEach(() => {
    delete process.env.PORT;
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    serveMock.mockReset();
  });

  it("listens on port 3000 when PORT is not set", async () => {
    await loadServer();

    expect(serveMock).toHaveBeenCalledWith(expect.objectContaining({ port: 3000 }));
  });

  it("listens on the port set in PORT", async () => {
    vi.stubEnv("PORT", "4000");

    await loadServer();

    expect(serveMock).toHaveBeenCalledWith(expect.objectContaining({ port: 4000 }));
  });

  it.each(["1", "65535"])("accepts the boundary port %s", async (port) => {
    vi.stubEnv("PORT", port);

    await loadServer();

    expect(serveMock).toHaveBeenCalledWith(expect.objectContaining({ port: Number(port) }));
  });

  it.each(["0", "65536", "1.5", "abc", "0x10", "1e3", " 4000 "])(
    "rejects the invalid port %j",
    async (port) => {
      vi.stubEnv("PORT", port);

      await expect(loadServer()).rejects.toThrow(`Invalid PORT: ${port}`);
      expect(serveMock).not.toHaveBeenCalled();
    },
  );

  it("starts without any database configuration", async () => {
    expect(process.env.DATABASE_URL).toBeUndefined();

    await loadServer();

    expect(serveMock).toHaveBeenCalledTimes(1);
  });
});
