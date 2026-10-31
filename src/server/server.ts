import { serve } from "@hono/node-server";
import { createApp } from "./app";

const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);

if (!/^\d+$/.test(rawPort) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${rawPort}`);
}

serve({ fetch: createApp().fetch, port });
