import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Icon } from "@/components/icon";
import { PrimaryLink, Pill } from "@/components/ui";

const steps = [
  { n: "01", title: "Cuéntanos sobre ti", text: "Un perfilamiento conversacional breve, claro y adaptativo." },
  { n: "02", title: "Conoce tu capacidad", text: "Estimamos tu rango de compra sin prometer aprobaciones." },
  { n: "03", title: "Encuentra tu proyecto", text: "Recibe opciones explicadas según presupuesto y preferencias." },
  { n: "04", title: "Llega listo al asesor", text: "Agenda con un resumen estructurado para avanzar al cierre." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PublicHeader />
      <main>
        <section className="relative mx-auto min-h-[780px] max-w-[1800px] overflow-hidden border-b border-black/[.06] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="hero-yellow-shape" />
          <div className="relative z-10 mx-auto grid max-w-[1500px] items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
            <div className="pt-8 lg:pt-16">
              <Pill tone="yellow">Reto de Vivienda · Colsubsidio 30X</Pill>
              <h1 className="mt-7 max-w-[820px] text-[clamp(3.6rem,7.6vw,8.5rem)] font-medium leading-[.84] tracking-[-.075em] text-[#0a0a0a]">
                Tu vivienda, más cerca de ti.
              </h1>
              <p className="mt-8 max-w-xl text-base leading-7 text-black/58 sm:text-lg">
                Descubre tu capacidad estimada, los proyectos que mejor encajan contigo y el siguiente paso para convertir tu interés en una oportunidad real.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryLink href="/vivienda/inicio">Comenzar mi perfil</PrimaryLink>
                <Link href="/vivienda/proyectos" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/15 bg-white/70 px-6 text-sm font-semibold backdrop-blur transition hover:bg-white">Explorar proyectos <Icon name="building" className="h-4 w-4" /></Link>
              </div>
              <div className="mt-14 grid max-w-xl grid-cols-3 gap-5 border-t border-black/10 pt-6">
                <div><div className="text-xl font-semibold">5 min</div><p className="mt-1 text-xs text-black/45">Perfilamiento guiado</p></div>
                <div><div className="text-xl font-semibold">24/7</div><p className="mt-1 text-xs text-black/45">Disponible siempre</p></div>
                <div><div className="text-xl font-semibold">100%</div><p className="mt-1 text-xs text-black/45">Resultado explicable</p></div>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[720px] lg:translate-y-8">
              <div className="absolute -left-5 top-20 z-20 w-[225px] rounded-[24px] bg-white p-5 shadow-[0_30px_80px_rgba(12,22,32,.15)] sm:-left-12">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#ffd000]/30 text-[#0067b1]"><Icon name="sparkles" /></span><div><div className="text-xs text-black/45">Compatibilidad</div><div className="text-lg font-semibold">94%</div></div></div>
                <div className="mt-4 h-2 rounded-full bg-black/[.06]"><div className="h-full w-[94%] rounded-full bg-[#0067b1]" /></div>
              </div>
              <Image src="/illustrations/hero-home.svg" alt="Ilustración de vivienda" width={900} height={760} className="floaty w-full rounded-[42px] shadow-[0_40px_110px_rgba(12,22,32,.18)]" priority />
              <div className="absolute -bottom-6 right-3 z-20 max-w-[250px] rounded-[24px] bg-[#0c1620] p-5 text-white shadow-2xl sm:right-8">
                <div className="text-[10px] font-bold uppercase tracking-[.15em] text-[#ffd000]">Próximo paso</div>
                <p className="mt-2 text-sm font-medium leading-5">Agenda una asesoría con tu perfil ya preparado.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.18em] text-[#0067b1]">Cómo funciona</div>
              <h2 className="mt-5 max-w-md text-5xl font-medium leading-[.95] tracking-[-.06em] sm:text-6xl">De un clic a una conversación de cierre.</h2>
            </div>
            <p className="max-w-xl self-end text-lg leading-8 text-black/48">El sistema convierte un lead digital en una oportunidad comercial contextualizada, trazable y priorizada.</p>
          </div>
          <div className="mt-16 divide-y divide-black/[.08] border-y border-black/[.08]">
            {steps.map((step) => (
              <div key={step.n} className="group grid gap-5 py-9 transition hover:bg-white lg:grid-cols-[120px_1fr_1fr] lg:px-5">
                <span className="font-mono text-xl font-semibold text-[#0067b1]">{step.n}</span>
                <h3 className="text-2xl font-semibold tracking-[-.035em]">{step.title}</h3>
                <div className="flex items-start justify-between gap-6"><p className="max-w-md text-sm leading-6 text-black/50">{step.text}</p><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 transition group-hover:bg-[#ffd000] group-hover:border-[#ffd000]"><Icon name="arrow" className="h-4 w-4" /></span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-5 pb-24 sm:px-8 lg:px-12 lg:pb-36">
          <div className="relative overflow-hidden rounded-[42px] bg-[#0067b1] px-7 py-14 text-white sm:px-12 lg:px-20 lg:py-20">
            <div className="absolute -right-20 -top-28 h-[420px] w-[420px] rounded-full bg-[#ffd000] blur-3xl" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div><div className="text-xs font-bold uppercase tracking-[.18em] text-[#ffd000]">Empieza ahora</div><h2 className="mt-5 max-w-3xl text-4xl font-medium leading-[1] tracking-[-.055em] sm:text-6xl">Una recomendación diseñada alrededor de tu realidad.</h2><p className="mt-5 max-w-2xl text-sm leading-6 text-white/65">Tus resultados son orientativos y no constituyen aprobación de crédito ni asignación garantizada de subsidios.</p></div>
              <Link href="/vivienda/inicio" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-[#0c1620] transition hover:bg-[#ffd000]">Crear mi perfil <Icon name="arrow" className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-black/[.07] px-5 py-8 text-xs text-black/45 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 sm:flex-row"><span>© 2026 Colsubsidio · Prototipo Vivienda Match AI</span><span>Privacidad · Tratamiento de datos · Accesibilidad</span></div></footer>
    </div>
  );
}
