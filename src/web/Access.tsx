import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";

type Mode = "sign-in" | "sign-up";
type FieldName = "name" | "email" | "password";

const MIN_PASSWORD_LENGTH = 8;

interface Failure {
  message: string;
  fields: readonly FieldName[];
  attempt: number;
}

const failures = {
  credentials: { message: "Correo o contraseña incorrectos.", fields: ["email", "password"] },
  emailTaken: { message: "Ya existe una cuenta con ese correo.", fields: ["email"] },
  passwordShort: {
    message: "La contraseña debe tener al menos " + String(MIN_PASSWORD_LENGTH) + " caracteres.",
    fields: ["password"],
  },
  signUp: { message: "No se pudo crear la cuenta. Inténtalo de nuevo.", fields: [] },
  network: { message: "No se pudo conectar con el servicio. Inténtalo de nuevo.", fields: [] },
} as const satisfies Record<string, { message: string; fields: readonly FieldName[] }>;

const errorCode = (payload: unknown): string | undefined => {
  if (typeof payload !== "object" || payload === null || !("code" in payload)) return undefined;
  const code = (payload as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
};

const field = (data: FormData, key: string): string => {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
};

interface AccessProps {
  mode: Mode;
}

export function Access({ mode }: AccessProps) {
  const signingIn = mode === "sign-in";
  const [failure, setFailure] = useState<Failure | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: unknown } | null;
  const from = typeof state?.from === "string" ? state.from : "/pipeline";

  useEffect(() => {
    const previous = document.title;
    document.title = signingIn ? "Entrar · Contento" : "Crear cuenta · Contento";
    return () => {
      document.title = previous;
    };
  }, [signingIn]);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = field(data, "email");
    const password = field(data, "password");
    const name = field(data, "name");
    if (!email || !password || (!signingIn && !name)) return;
    const body = signingIn ? { email, password } : { name, email, password };
    const endpoint = signingIn ? "/api/auth/sign-in/email" : "/api/auth/sign-up/email";
    setSubmitting(true);
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      setSubmitting(false);
      setFailure((current) => ({ ...failures.network, attempt: (current?.attempt ?? 0) + 1 }));
      return;
    }
    setSubmitting(false);
    if (response.ok) {
      void navigate(from, { replace: true });
      return;
    }
    if (signingIn) {
      const kind = response.status === 401 ? failures.credentials : failures.network;
      setFailure((current) => ({ ...kind, attempt: (current?.attempt ?? 0) + 1 }));
      return;
    }
    const payload: unknown = await response.json().catch(() => null);
    const code = errorCode(payload);
    const kind =
      code === "USER_ALREADY_EXISTS"
        ? failures.emailTaken
        : code === "PASSWORD_TOO_SHORT"
          ? failures.passwordShort
          : failures.signUp;
    setFailure((current) => ({ ...kind, attempt: (current?.attempt ?? 0) + 1 }));
  };

  const describedBy = (name: FieldName, hint?: string) =>
    [hint, failure?.fields.includes(name) ? "access-error" : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  const invalid = (name: FieldName) => (failure?.fields.includes(name) ? true : undefined);

  return (
    <main className="access-screen">
      <form
        className="access-card"
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <header className="access-header">
          <p className="access-brand">Contento</p>
          <h1>{signingIn ? "Entrar" : "Crear cuenta"}</h1>
        </header>
        {!signingIn && (
          <label className="field">
            <span>Nombre</span>
            <input name="name" type="text" required autoComplete="name" autoFocus />
          </label>
        )}
        <label className="field">
          <span>Correo</span>
          <input
            name="email"
            type="email"
            required
            autoComplete={signingIn ? "username" : "email"}
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus={signingIn}
            aria-invalid={invalid("email")}
            aria-describedby={describedBy("email")}
          />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            name="password"
            type="password"
            required
            minLength={signingIn ? undefined : MIN_PASSWORD_LENGTH}
            autoComplete={signingIn ? "current-password" : "new-password"}
            aria-invalid={invalid("password")}
            aria-describedby={describedBy("password", signingIn ? undefined : "password-hint")}
          />
        </label>
        {!signingIn && (
          <p className="field-hint" id="password-hint">
            Mínimo {MIN_PASSWORD_LENGTH} caracteres.
          </p>
        )}
        {failure !== null && (
          <p className="access-error" id="access-error" role="alert" key={failure.attempt}>
            {failure.message}
          </p>
        )}
        <button className="primary-action" type="submit" disabled={submitting}>
          {submitting ? (signingIn ? "Entrando…" : "Creando cuenta…") : signingIn ? "Entrar" : "Crear cuenta"}
        </button>
        <Link
          className="secondary-action"
          to={signingIn ? "/registro" : "/login"}
          state={state}
        >
          {signingIn ? "Crear una cuenta" : "Ya tengo cuenta"}
        </Link>
      </form>
    </main>
  );
}
