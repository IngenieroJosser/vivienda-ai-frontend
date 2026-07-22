import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Icon } from "@/components/icon";
import { AnimatedHeroBackground } from "@/components/animated-hero-background";

const steps = [
  { n: "01", title: "Cuéntanos sobre ti", text: "Un perfilamiento conversacional breve, claro y adaptativo." },
  { n: "02", title: "Conoce tu capacidad", text: "Estimamos capacidad y subsidios potenciales sin aprobar crédito." },
  { n: "03", title: "Encuentra tu proyecto", text: "Mostramos máximo tres proyectos compatibles, no todo el catálogo." },
  { n: "04", title: "Llega listo al asesor", text: "El asesor recibe un resumen listo para validar y agendar visita." },
];

export default function Home() {
  return (
    <div className="home-page min-h-screen overflow-x-hidden bg-[#fafafa]">
      <PublicHeader />
      <main>
        <section className="liquid-home-hero relative mx-auto min-h-[calc(100svh-72px)] max-w-[1900px] overflow-hidden border-b border-black/[.06]">
          <AnimatedHeroBackground variant="hero" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-72px)] max-w-[1500px] items-center px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
            <div className="hero-copy max-w-[920px]">
              <div className="liquid-eyebrow inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/42 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-black/62 shadow-[0_10px_35px_rgba(17,24,32,.08)] backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-[#0067b1] shadow-[0_0_0_5px_rgba(0,103,177,.10)]" />
                Vivienda Match AI · Colsubsidio
              </div>

              <h1 className="mt-7 max-w-[920px] text-[clamp(4.25rem,8.5vw,9.6rem)] font-medium leading-[.82] tracking-[-.078em] text-[#080b0d]">
                Leads pagos que llegan listos para cerrar.
              </h1>

              <p className="mt-8 max-w-2xl text-base font-medium leading-7 text-black/58 sm:text-lg lg:text-xl lg:leading-8">
                Perfilamos cada lead antes del asesor: distinguimos afiliación, estimamos capacidad, recomendamos proyectos y definimos si debe pasar a cierre o a una ruta de nutrición.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/vivienda/inicio" prefetch className="liquid-primary-button group inline-flex h-[52px] items-center justify-center gap-3 rounded-full bg-[#111820] px-7 text-sm font-bold text-white shadow-[0_18px_42px_rgba(17,24,32,.22)] transition hover:-translate-y-1 hover:bg-[#0067b1]">
                  Perfilarme ahora
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/12 transition group-hover:translate-x-0.5"><Icon name="arrow" className="h-4 w-4" /></span>
                </Link>
                <Link href="/vivienda/proyectos" prefetch className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-black/12 bg-white/48 px-6 text-sm font-bold text-black/66 shadow-[0_14px_38px_rgba(17,24,32,.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/72 hover:text-[#0067b1]">
                  Explorar proyectos <Icon name="building" className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="liquid-hero-insight absolute bottom-7 left-5 right-5 z-20 grid gap-3 sm:left-auto sm:right-8 sm:w-[520px] sm:grid-cols-[1fr_auto] lg:bottom-10 lg:right-12">
              <div className="rounded-[26px] border border-white/45 bg-white/42 p-5 shadow-[0_24px_70px_rgba(17,24,32,.12)] backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-[.16em] text-black/42">Experiencia guiada</div>
                    <div className="mt-1 text-sm font-bold text-[#111820]">Afiliación, capacidad y ruta en aproximadamente 5 minutos</div>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[#ffd000] text-[#111820] shadow-[0_12px_30px_rgba(255,208,0,.30)]"><Icon name="sparkles" className="h-5 w-5" /></span>
                </div>
              </div>
              <div className="grid grid-cols-3 rounded-[26px] border border-white/30 bg-[#111820]/92 px-4 py-4 text-white shadow-[0_24px_70px_rgba(17,24,32,.18)] backdrop-blur-xl sm:grid-cols-1 sm:px-5">
                <div className="text-center sm:text-left"><div className="text-lg font-bold text-[#ffd000]">24/7</div><div className="text-[9px] text-white/45">Disponible</div></div>
                <div className="text-center sm:hidden"><div className="text-lg font-bold">100%</div><div className="text-[9px] text-white/45">Explicable</div></div>
                <div className="text-center sm:hidden"><div className="text-lg font-bold">5 min</div><div className="text-[9px] text-white/45">Promedio</div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="relative mx-auto max-w-[1500px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
          <div className="section-orb section-orb--yellow" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[.18em] text-[#0067b1]">Cómo funciona</div>
              <h2 className="mt-5 max-w-lg text-5xl font-medium leading-[.94] tracking-[-.065em] sm:text-7xl">De lead pago a oportunidad de cierre.</h2>
            </div>
            <p className="max-w-xl self-end text-lg leading-8 text-black/48">El sistema recibe leads multicanal, pregunta solo lo necesario y entrega al asesor únicamente los perfiles que están preparados para avanzar.</p>
          </div>

          <div className="relative mt-16 overflow-hidden rounded-[34px] border border-black/[.07] bg-white/72 shadow-[0_28px_90px_rgba(17,24,32,.07)] backdrop-blur-xl">
            {steps.map((step) => (
              <div key={step.n} className="step-row group grid gap-5 border-b border-black/[.065] px-6 py-9 transition last:border-b-0 hover:bg-[#fff8d4]/55 lg:grid-cols-[120px_1fr_1fr] lg:px-9">
                <span className="font-mono text-xl font-semibold text-[#0067b1]">{step.n}</span>
                <h3 className="text-2xl font-semibold tracking-[-.04em]">{step.title}</h3>
                <div className="flex items-start justify-between gap-6"><p className="max-w-md text-sm leading-6 text-black/50">{step.text}</p><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white transition group-hover:rotate-[-8deg] group-hover:border-[#ffd000] group-hover:bg-[#ffd000]"><Icon name="arrow" className="h-4 w-4" /></span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-5 pb-24 sm:px-8 lg:px-12 lg:pb-36">
          <div className="liquid-cta relative overflow-hidden rounded-[44px] bg-[#0c1620] px-7 py-16 text-white shadow-[0_35px_110px_rgba(17,24,32,.20)] sm:px-12 lg:px-20 lg:py-24">
            <AnimatedHeroBackground variant="dark" compact />
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div><div className="text-xs font-extrabold uppercase tracking-[.18em] text-[#ffd000]">Empieza ahora</div><h2 className="mt-5 max-w-4xl text-4xl font-medium leading-[.95] tracking-[-.06em] sm:text-7xl">Una recomendación creada alrededor de tu realidad.</h2><p className="mt-6 max-w-2xl text-sm leading-6 text-white/62">Tus resultados son orientativos y no constituyen aprobación de crédito ni asignación garantizada de subsidios.</p></div>
              <Link href="/vivienda/inicio" prefetch className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-[#0c1620] shadow-xl transition hover:-translate-y-1 hover:bg-[#ffd000]">Crear mi perfil <Icon name="arrow" className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-black/[.07] px-5 py-8 text-xs text-black/45 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 sm:flex-row"><span>© 2026 Colsubsidio · Prototipo Vivienda Match AI</span><span>Privacidad · Tratamiento de datos · Accesibilidad</span></div></footer>
    </div>
  );
}
