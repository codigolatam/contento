import { vi } from "vitest";
import { authClient } from "../auth-client";

export const urlOf = (input: unknown): string =>
  input instanceof Request ? input.url : String(input);

export const pathOf = (input: unknown): string => new URL(urlOf(input)).pathname;

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export const sessionResponse = (signedIn: boolean) =>
  json(
    signedIn
      ? {
          session: { id: "session-1", token: "token-1" },
          user: { id: "user-1", email: "ada@example.com", name: "Ada" },
        }
      : null,
  );

export const stubSession = (signedIn: boolean) => {
  const spy = vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(sessionResponse(signedIn)));
  refreshSession();
  return spy;
};

interface SessionAtomValue {
  data: unknown;
  error: unknown;
  isPending: boolean;
  isRefetching: boolean;
  refetch: () => Promise<void>;
}

const sessionAtom = () => {
  const atom = authClient.$store.atoms.session as
    | { get(): SessionAtomValue; set(value: SessionAtomValue): void }
    | undefined;
  if (atom === undefined) throw new Error("the session atom is not registered");
  return atom;
};

export const refreshSession = () => {
  void sessionAtom().get().refetch();
};

export const resetSessionStore = () => {
  const atom = sessionAtom();
  atom.set({ ...atom.get(), data: null, error: null, isPending: true, isRefetching: false });
};
