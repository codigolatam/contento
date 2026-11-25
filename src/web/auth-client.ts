import { createAuthClient } from "better-auth/react";

// better-auth captures the global `fetch` eagerly at client creation; routing
// through globalThis keeps the lookup lazy so tests can stub it.
export const authClient = createAuthClient({
  fetchOptions: {
    customFetchImpl: (input, init) => globalThis.fetch(input, init),
  },
});
