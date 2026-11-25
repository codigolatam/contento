import { Fragment, useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useLocation } from "react-router";
import { authClient } from "./auth-client";
import type { ReturnRouteState } from "./session";

type Mode = "sign-in" | "sign-up";
type FieldName = "name" | "email" | "password";

// Mirrors the better-auth sign-up default; keep in sync with the server config.
const MIN_PASSWORD_LENGTH = 8;

interface FieldSpec {
  name: FieldName;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  inputMode?: "email";
  autoCapitalize?: "none";
  spellCheck?: boolean;
  autoFocus?: boolean;
  minLength?: number;
  hintId?: string;
}

interface Failure {
  message: string;
  fields: readonly FieldName[];
  attempt: number;
}

type FailureKind = Omit<Failure, "attempt">;

interface AuthError {
  status?: unknown;
  code?: unknown;
}

interface ModeSpec {
  title: string;
  heading: string;
  submitLabel: string;
  submittingLabel: string;
  altLink: { to: string; label: string };
  fields: readonly FieldSpec[];
  action: (data: FormData) => Promise<{ error: AuthError | null }>;
  failureFor: (error: AuthError) => FailureKind;
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

export const field = (data: FormData, key: string): string => {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
};

const MODES: Record<Mode, ModeSpec> = {
  "sign-in": {
    title: "Entrar · Contento",
    heading: "Entrar",
    submitLabel: "Entrar",
    submittingLabel: "Entrando…",
    altLink: { to: "/registro", label: "Crear una cuenta" },
    fields: [
      {
        name: "email",
        label: "Correo",
        type: "email",
        autoComplete: "username",
        inputMode: "email",
        autoCapitalize: "none",
        spellCheck: false,
        autoFocus: true,
      },
      { name: "password", label: "Contraseña", type: "password", autoComplete: "current-password" },
    ],
    action: (data) =>
      authClient.signIn.email({ email: field(data, "email"), password: field(data, "password") }),
    failureFor: (error) => (error.status === 401 ? failures.credentials : failures.network),
  },
  "sign-up": {
    title: "Crear cuenta · Contento",
    heading: "Crear cuenta",
    submitLabel: "Crear cuenta",
    submittingLabel: "Creando cuenta…",
    altLink: { to: "/login", label: "Ya tengo cuenta" },
    fields: [
      { name: "name", label: "Nombre", type: "text", autoComplete: "name", autoFocus: true },
      {
        name: "email",
        label: "Correo",
        type: "email",
        autoComplete: "email",
        inputMode: "email",
        autoCapitalize: "none",
        spellCheck: false,
      },
      {
        name: "password",
        label: "Contraseña",
        type: "password",
        autoComplete: "new-password",
        minLength: MIN_PASSWORD_LENGTH,
        hintId: "password-hint",
      },
    ],
    action: (data) =>
      authClient.signUp.email({
        name: field(data, "name"),
        email: field(data, "email"),
        password: field(data, "password"),
      }),
    failureFor: (error) => {
      const code = typeof error.code === "string" ? error.code : undefined;
      if (code === "USER_ALREADY_EXISTS") return failures.emailTaken;
      if (code === "PASSWORD_TOO_SHORT") return failures.passwordShort;
      return failures.signUp;
    },
  },
};

interface AccessProps {
  mode: Mode;
}

export function Access({ mode }: AccessProps) {
  const { title, heading, submitLabel, submittingLabel, altLink, fields, action, failureFor } =
    MODES[mode];
  const [failure, setFailure] = useState<Failure | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const state = location.state as ReturnRouteState | null;

  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);

  const fail = (kind: FailureKind) => {
    setFailure((current) => ({ ...kind, attempt: (current?.attempt ?? 0) + 1 }));
  };

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!fields.every(({ name }) => field(data, name))) return;
    setSubmitting(true);
    try {
      const { error } = await action(data);
      if (error === null) {
        setFailure(null);
      } else {
        fail(failureFor(error));
      }
    } catch {
      fail(failures.network);
    } finally {
      setSubmitting(false);
    }
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
          <h1>{heading}</h1>
        </header>
        {fields.map((spec) => (
          <Fragment key={spec.name}>
            <label className="field">
              <span>{spec.label}</span>
              <input
                name={spec.name}
                type={spec.type}
                required
                autoComplete={spec.autoComplete}
                inputMode={spec.inputMode}
                autoCapitalize={spec.autoCapitalize}
                spellCheck={spec.spellCheck}
                autoFocus={spec.autoFocus}
                minLength={spec.minLength}
                aria-invalid={invalid(spec.name)}
                aria-describedby={describedBy(spec.name, spec.hintId)}
              />
            </label>
            {spec.hintId !== undefined && (
              <p className="field-hint" id={spec.hintId}>
                Mínimo {MIN_PASSWORD_LENGTH} caracteres.
              </p>
            )}
          </Fragment>
        ))}
        {failure !== null && (
          <p className="access-error" id="access-error" role="alert" key={failure.attempt}>
            {failure.message}
          </p>
        )}
        <button className="primary-action" type="submit" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </button>
        <Link className="secondary-action" to={altLink.to} state={state}>
          {altLink.label}
        </Link>
      </form>
    </main>
  );
}
