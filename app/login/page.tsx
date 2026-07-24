import Image from "next/image";
import { ProductBrand } from "@/components/brand";
import { Icon } from "@/components/icon";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="login-stage grid min-h-screen bg-[color:var(--vm-color-canvas-muted)] lg:grid-cols-[minmax(500px,.9fr)_1.1fr]">
      <section className="relative z-10 flex flex-col bg-white p-6 sm:p-10 lg:p-12">
        <ProductBrand />
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-12 sm:py-14">
          <LoginForm />
        </div>
      </section>

      <section className="relative hidden min-h-screen overflow-hidden bg-[color:var(--vm-color-brand-blue-deep)] text-white lg:block">
        <Image
          src="/images/projects/versalles.webp"
          alt="Proyecto residencial Versalles de Colsubsidio"
          fill
          loading="lazy"
          quality={90}
          sizes="55vw"
          className="object-cover object-center"
        />
        <div className="login-readable-overlay absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col justify-end p-10 xl:p-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[.1em]">
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
