import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Icon } from "@/components/icon";
import { FeaturedProjectsShowcase } from "@/components/featured-projects-showcase";
import { StructuredData } from "@/components/structured-data";
import { LandingConversationComposer } from "@/features/prospect/components/landing-conversation-composer";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Orientación para encontrar una vivienda que encaje contigo",
  description:
    "Cuéntanos qué vivienda buscas y recibe una orientación personalizada con proyectos compatibles y un siguiente paso claro.",
  path: "/",
});

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.colsubsidio.com/#organization",
        name: "Colsubsidio",
        url: "https://www.colsubsidio.com/",
        logo: absoluteUrl("/brand/colsubsidio-logo.svg"),
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        name: "Vivienda Colsubsidio",
        url: absoluteUrl("/"),
        inLanguage: "es-CO",
        publisher: { "@id": "https://www.colsubsidio.com/#organization" },
      },
      {
        "@type": "Service",
        "@id": `${absoluteUrl("/")}#housing-guidance`,
        name: "Orientación personalizada de vivienda",
        serviceType: "Orientación para búsqueda y preparación de vivienda",
        areaServed: { "@type": "Country", name: "Colombia" },
        provider: { "@id": "https://www.colsubsidio.com/#organization" },
        url: absoluteUrl("/"),
      },
    ],
  };

  return (
    <div className="home-page prospect-landing min-h-screen overflow-hidden bg-[color:var(--vm-color-canvas)] text-[color:var(--vm-color-ink)]">
      <StructuredData data={structuredData} />
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
              <Link href="/vivienda/proyectos" className="font-bold text-[color:var(--vm-color-brand-blue)] underline-offset-4 hover:underline">
                Explorar todos los proyectos
              </Link>
            </div>
          </div>

          <FeaturedProjectsShowcase />
        </section>
      </main>
    </div>
  );
}
