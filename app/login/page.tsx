"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ProductBrand } from "@/components/brand";
import { Icon } from "@/components/icon";
import {
  validateLogin,
  type LoginCredentials,
  type LoginErrors,
} from "@/features/auth/login-validation";

const initialCredentials: LoginCredentials = {
  email: "",
  password: "",
};

export default function LoginPage() {
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
    <main className="login-stage grid min-h-screen bg-[#f5f7f8] lg:grid-cols-[minmax(500px,.9fr)_1.1fr]">
      <section className="relative z-10 flex flex-col bg-white p-6 sm:p-10 lg:p-12">
        <ProductBrand />
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-12 sm:py-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)]/[.055] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[color:var(--vm-color-brand-blue)]">
            <Icon name="lock" className="h-3.5 w-3.5" />
            Acceso para asesores
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-[-.05em] text-[color:var(--vm-color-brand-blue-deep)] sm:text-5xl">
            Portal comercial
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
            Consulta oportunidades priorizadas, actividades pendientes y rutas
            de acompañamiento desde un solo lugar.
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
                  aria-describedby={errors.email ? "advisor-email-error" : undefined}
                  placeholder="nombre@empresa.com"
                />
              </div>
              {errors.email ? (
                <span
                  id="advisor-email-error"
                  role="alert"
                  className="mt-1.5 block text-xs text-rose-700"
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
                  className="mt-1.5 block text-xs text-rose-700"
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
              Acceso de prototipo: valida el formato localmente y permite
              recorrer el portal. La identidad corporativa real se conectará
              mediante el proveedor autorizado.
            </p>
          </div>
        </div>
      </section>

      <section className="relative hidden min-h-screen overflow-hidden bg-[color:var(--vm-color-brand-blue-deep)] text-white lg:block">
        <Image
          src="/images/projects/versalles.webp"
          alt="Proyecto residencial Versalles de Colsubsidio"
          fill
          priority
          unoptimized
          sizes="55vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,103,177,.08)_0%,rgba(0,65,112,.62)_55%,rgba(0,65,112,.96)_100%)]" />
        <div className="relative z-10 flex h-full flex-col justify-end p-10 xl:p-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em]">
              Colsubsidio · Vivienda
            </div>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-.045em] xl:text-5xl">
              Empieza cada jornada con una prioridad clara.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/82">
              Conoce a quién contactar, por qué está preparado y cuál es el
              siguiente paso para acompañar su decisión de vivienda.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <PortalBenefit icon="target" label="Oportunidades priorizadas" />
              <PortalBenefit icon="calendar" label="Agenda conectada" />
              <PortalBenefit icon="heart" label="Acompañamiento supervisado" />
            </div>

            <div className="mt-8 border-t border-white/20 pt-4 text-[11px] text-white/70">
              Imagen de proyecto: Versalles · Soacha
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PortalBenefit({
  icon,
  label,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
}) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-[var(--vm-radius-control)] border border-white/20 bg-white/10 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/14">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="text-xs font-semibold leading-5">{label}</span>
    </div>
  );
}
