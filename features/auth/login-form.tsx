"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import {
  validateLogin,
  type LoginCredentials,
  type LoginErrors,
} from "./login-validation";

const initialCredentials: LoginCredentials = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const [credentials, setCredentials] =
    useState<LoginCredentials>(initialCredentials);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof LoginCredentials, value: string) {
    setCredentials((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateLogin(credentials);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    router.push("/asesor");
  }

  return (
    <>
      <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)]/[.055] px-3 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
        <Icon name="lock" className="h-3.5 w-3.5" />
        Acceso para asesores
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-[-.05em] text-[color:var(--vm-color-brand-blue-deep)] sm:text-5xl">
        Portal comercial
      </h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
        Consulta oportunidades priorizadas, actividades pendientes y rutas de
        acompañamiento desde un solo lugar.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={submit}
        noValidate
        aria-describedby="login-status"
      >
        <label className="block" htmlFor="advisor-email">
          <span className="form-label">Correo corporativo</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-12 items-center justify-center text-[color:var(--vm-color-ink-muted)]">
              <Icon name="mail" className="h-4 w-4" />
            </span>
            <input
              id="advisor-email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="form-field login-field"
              autoComplete="username"
              inputMode="email"
              autoFocus
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "advisor-email-error" : undefined
              }
              placeholder="nombre@empresa.com"
            />
          </div>
          {errors.email ? (
            <span
              id="advisor-email-error"
              role="alert"
              className="mt-1.5 block text-xs text-[color:var(--vm-color-error)]"
            >
              {errors.email}
            </span>
          ) : null}
        </label>

        <label className="block" htmlFor="advisor-password">
          <span className="form-label">Contraseña</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-12 items-center justify-center text-[color:var(--vm-color-ink-muted)]">
              <Icon name="lock" className="h-4 w-4" />
            </span>
            <input
              id="advisor-password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={(event) =>
                updateField("password", event.target.value)
              }
              className="form-field login-field"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "advisor-password-error" : undefined
              }
              placeholder="Ingresa tu contraseña"
            />
          </div>
          {errors.password ? (
            <span
              id="advisor-password-error"
              role="alert"
              className="mt-1.5 block text-xs text-[color:var(--vm-color-error)]"
            >
              {errors.password}
            </span>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white shadow-[var(--vm-shadow-low)] transition hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)] disabled:cursor-wait disabled:opacity-65"
        >
          {submitting ? "Ingresando…" : "Ingresar al portal"}
          {!submitting ? <Icon name="arrow" className="h-4 w-4" /> : null}
        </button>
      </form>

      <div
        id="login-status"
        className="mt-5 flex items-start gap-2 rounded-[var(--vm-radius-control)] border border-[color:var(--vm-color-line)] bg-[color:var(--vm-color-canvas)] p-3 text-[11px] leading-5 text-[color:var(--vm-color-ink-muted)]"
      >
        <Icon
          name="info"
          className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--vm-color-brand-blue)]"
        />
        <p>
          Este acceso permite recorrer el portal con información de muestra.
          La identidad corporativa se conectará mediante el proveedor autorizado.
        </p>
      </div>
    </>
  );
}
