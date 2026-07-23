import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Icon } from "@/components/icon";
import { LandingConversationComposer } from "@/features/prospect/components/landing-conversation-composer";

export default function Home() {
  return (
    <div className="home-page prospect-landing min-h-screen overflow-hidden bg-[color:var(--vm-color-canvas)] text-[color:var(--vm-color-ink)]">
      <PublicHeader />

      <main className="relative">
        <div className="prospect-landing__ambient" aria-hidden="true" />

        <section className="relative z-10 mx-auto grid min-h-[calc(100svh-80px)] max-w-[1460px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,.92fr)_minmax(420px,1.08fr)] lg:items-center lg:px-12 lg:py-10">
          <div className="relative z-10 max-w-[720px] py-4 lg:py-8">
            <div className="motion-rise inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
              <span className="h-2 w-2 rounded-full bg-[color:var(--vm-color-brand-yellow)]" />
              Vivienda Colsubsidio
            </div>

            <h1 className="motion-rise motion-delay-1 mt-5 text-[clamp(3.1rem,6.2vw,6.8rem)] font-semibold leading-[.9] tracking-[-.065em]">
              Hablemos de la vivienda que imaginas.
            </h1>

            <p className="motion-rise motion-delay-2 mt-6 max-w-[640px] text-base leading-7 text-[color:var(--vm-color-ink-muted)] sm:text-lg sm:leading-8">
              Cuéntanos qué buscas y qué te mueve a comenzar ahora. Comprendemos tu momento, revisamos tus posibilidades y te mostramos un camino claro para avanzar.
            </p>

            <LandingConversationComposer />

            <div className="motion-rise motion-delay-3 mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[color:var(--vm-color-ink-muted)]">
              <span className="inline-flex items-center gap-2">
                <Icon name="shield" className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" />
                Conversación privada
              </span>
              <span>No necesitas documentos para comenzar</span>
              <Link href="/vivienda/proyectos/versalles" className="font-bold text-[color:var(--vm-color-brand-blue)] underline-offset-4 hover:underline">
                Conocer Versalles
              </Link>
            </div>
          </div>

          <figure className="motion-rise motion-delay-2 relative min-h-[300px] overflow-hidden rounded-[var(--vm-radius-elevated)] shadow-[var(--vm-shadow-high)] sm:min-h-[420px] lg:h-[min(76svh,760px)]">
            <Image
              src="/images/versalles-porteria-hero.webp"
              alt="Fachada y portería del proyecto de vivienda Versalles en Ciudadela Maiporé, Soacha"
              fill
              preload
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,79,140,.02),rgba(0,79,140,.42))]" aria-hidden="true" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="max-w-md text-2xl font-semibold leading-tight tracking-[-.035em] sm:text-3xl">
                Primero entendemos tu sueño. Después encontramos la ruta.
              </p>
              <a
                href="https://www.colsubsidio.com/vivienda/proyectos/soacha/versalles"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-[10px] font-semibold tracking-[.02em] text-white/80 underline-offset-4 hover:underline"
              >
                Proyecto Versalles · Vivienda Colsubsidio
              </a>
            </figcaption>
          </figure>
        </section>
      </main>
    </div>
  );
}
