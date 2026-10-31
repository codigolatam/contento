import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const apiPort = process.env.PORT ?? "3000";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/health": `http://localhost:${apiPort}` } },
});
