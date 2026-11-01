import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: ["src/server/schema.ts"],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
    projects: [
      {
        test: { name: "server", environment: "node", include: ["src/server/**/*.test.ts"] },
      },
      {
        test: { name: "web", environment: "jsdom", include: ["src/web/**/*.test.tsx"] },
      },
    ],
  },
});
