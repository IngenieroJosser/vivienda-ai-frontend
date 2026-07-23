import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Icon } from "@/components/icon";
import { projects } from "@/lib/data";

const benefits = [
  ["≈ 5 minutos", "Orientación inicial"],
  ["Hasta 3", "Proyectos compatibles"],
  ["A tu ritmo", "Avanza cuando quieras"],
  ["Con asesor", "Cuando estés preparado"],
] as const;

const steps = [
  ["01", "Conversemos sobre ti", "Una experiencia breve que se adapta a tus respuestas."],
  ["02", "Entendemos tus posibilidades", "Estimamos rangos orientativos sin aprobar créditos ni prometer beneficios."],
  ["03", "Filtramos las opciones", "Comparamos tu perfil con los proyectos disponibles y presentamos máximo tres."],
  ["04", "Te ayudamos a avanzar", "Recibes un siguiente paso claro y acompañamiento de un asesor cuando corresponda."],
] as const;

const previewAnswers = [
  "Una cuota que pueda manejar",
  "Buena ubicación",
  "Espacio para mi familia",
] as const;

export default function Home() {
  const project = projects[0];

  return (
    <div className="home-page min-h-screen overflow-x-hidden bg-[color:var(--vm-color-canvas)]">
      <PublicHeader />
      <main>
        <section className="prospect-hero relative overflow-hidden">
          <div className="prospect-hero__glow" aria-hidden="true" />
          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-76px)] max-w-[1460px] items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(420px,.76fr)] lg:px-12 lg:py-20">
            <div className="max-w-[760px]">
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)]/[.07] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">
                <span className="h-2 w-2 rounded-full bg-[color:var(--vm-color-brand-yellow)]" />
                Vivienda Match AI · Orientación personalizada
              </div>
              <h1 className="mt-7 text-[clamp(3.25rem,6.8vw,7.2rem)] font-semibold leading-[.88] tracking-[-.065em] text-[color:var(--vm-color-ink)]">
                Encuentra una vivienda que sí encaje contigo.
              </h1>
              <p className="mt-7 max-w-[680px] text-base leading-7 text-[color:var(--vm-color-ink-muted)] sm:text-lg sm:leading-8">
                Cuéntanos qué buscas y cuál es tu momento. En aproximadamente cinco minutos te orientamos con hasta tres proyectos compatibles y un siguiente paso claro, seas afiliado o no.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/demo" prefetch className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[color:var(--vm-color-brand-blue)] px-7 text-sm font-bold text-white shadow-[var(--vm-shadow-medium)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]">
                  Empezar mi orientación <Icon name="arrow" className="h-4 w-4" />
                </Link>
                <Link href="/vivienda/proyectos" prefetch className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[color:var(--vm-color-brand-blue)]/20 bg-white px-7 text-sm font-bold text-[color:var(--vm-color-brand-blue-deep)] transition duration-200 hover:border-[color:var(--vm-color-brand-blue)] hover:text-[color:var(--vm-color-brand-blue)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]">
                  Explorar proyectos
                </Link>
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-[.01em] text-[color:var(--vm-color-ink-muted)]">
                <Icon name="shield" className="h-4 w-4 text-[color:var(--vm-color-brand-blue)]" />
                No necesitas documentos para comenzar · Resultados orientativos
              </p>
            </div>

            <article className="glass-elevated prospect-conversation relative overflow-hidden p-5 sm:p-7" aria-label="Vista previa de la conversación">
              <div className="flex items-center justify-between border-b border-[color:var(--vm-color-brand-blue)]/10 pb-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--vm-color-brand-blue)] text-white"><Icon name="sparkles" className="h-5 w-5" /></span>
                  <div><div className="text-sm font-bold">Asesor digital de vivienda</div><div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[.02em] text-[color:var(--vm-color-success)]"><span className="h-1.5 w-1.5 rounded-full bg-current" />Orientación guiada</div></div>
                </div>
                <span className="rounded-full bg-[color:var(--vm-color-brand-blue)]/[.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue-deep)]">Vista previa</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="max-w-[88%] rounded-[18px_18px_18px_6px] bg-white p-4 text-sm leading-6 shadow-[var(--vm-shadow-low)]">Hola, quiero ayudarte a encontrar una opción que se ajuste a ti.</div>
                <div className="max-w-[92%] rounded-[18px_18px_18px_6px] bg-white p-4 text-sm leading-6 shadow-[var(--vm-shadow-low)]">Empecemos por lo importante: ¿qué necesitas de tu próxima vivienda?</div>
                <div className="space-y-2.5 pt-1" aria-label="Ejemplos de respuesta">
                  {previewAnswers.map((answer) => <div key={answer} className="rounded-[14px] border border-[color:var(--vm-color-brand-blue)]/15 bg-[color:var(--vm-color-brand-blue)]/[.045] px-4 py-3 text-sm font-semibold text-[color:var(--vm-color-ink)]">{answer}</div>)}
                </div>
              </div>
              <Link href="/demo" prefetch className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-5 text-sm font-bold text-white transition duration-200 hover:bg-[color:var(--vm-color-brand-blue-deep)] focus-visible:outline-none focus-visible:shadow-[var(--vm-shadow-focus)]">
                Iniciar conversación <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </article>
          </div>
        </section>

        <section aria-label="Beneficios de la orientación" className="border-y border-[color:var(--vm-color-brand-blue)]/10 bg-[#eef8ff] text-[color:var(--vm-color-brand-blue-deep)]">
          <div className="mx-auto grid max-w-[1460px] grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-12">
            {benefits.map(([value, label]) => <div key={label} className="border-[color:var(--vm-color-brand-blue)]/10 px-3 py-7 text-center even:border-l lg:border-l lg:first:border-l-0 lg:py-8"><div className="text-xl font-bold tracking-[-.03em] text-[color:var(--vm-color-brand-blue)] sm:text-2xl">{value}</div><div className="mt-1 text-sm tracking-[.01em] text-[color:var(--vm-color-ink-muted)]">{label}</div></div>)}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-[1460px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Cómo funciona</div><h2 className="mt-4 text-4xl font-semibold leading-[.95] tracking-[-.05em] sm:text-6xl">Menos preguntas. Más claridad.</h2></div>
            <p className="max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)] lg:justify-self-end">Te preguntamos únicamente lo necesario para comprender tu búsqueda y mostrarte una ruta clara.</p>
          </div>
          <div className="surface-solid mt-12 overflow-hidden">
            {steps.map(([number, title, description]) => <article key={number} className="grid gap-4 border-b border-[color:var(--vm-color-brand-blue)]/10 p-6 last:border-b-0 sm:p-8 lg:grid-cols-[90px_.8fr_1.2fr] lg:items-center"><span className="font-mono text-sm font-bold text-[color:var(--vm-color-brand-blue)]">{number}</span><h3 className="text-xl font-semibold tracking-[-.025em]">{title}</h3><p className="text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">{description}</p></article>)}
          </div>
        </section>

        <section className="mx-auto max-w-[1460px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="surface-solid relative overflow-hidden p-7 sm:p-10 lg:grid lg:grid-cols-[.8fr_1.2fr] lg:gap-14 lg:p-14">
            <div><div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Una orientación para todos</div><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">Seas afiliado o no, empezamos por escucharte.</h2></div>
            <p className="mt-6 self-end text-base leading-8 text-[color:var(--vm-color-ink-muted)] lg:mt-0">La afiliación puede influir en los beneficios disponibles, pero nunca reduce la calidad de la orientación ni del acompañamiento.</p>
          </div>
        </section>

        <section className="bg-[#f2f7fa]">
          <div className="mx-auto max-w-[1460px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Proyectos</div><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Explora los proyectos disponibles.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--vm-color-ink-muted)]">Conoce sus características, ubicación y espacios antes de iniciar tu orientación personalizada.</p></div><Link href="/vivienda/proyectos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white">Ver proyectos <Icon name="arrow" className="h-4 w-4" /></Link></div>
            <article className="surface-solid mt-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><div className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--vm-color-brand-blue)]">{project.city} · {project.zone}</div><h3 className="mt-2 text-3xl font-semibold tracking-[-.04em]">{project.name}</h3><p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">Consulta la información vigente del fixture antes de iniciar tu orientación.</p></div>
              <dl className="grid grid-cols-3 gap-3 text-center"><div className="rounded-[14px] bg-[color:var(--vm-color-brand-blue)]/[.055] p-4"><dt className="text-[10px] text-[color:var(--vm-color-ink-muted)]">Precio</dt><dd className="mt-1 text-sm font-bold">{project.priceLabel}</dd></div><div className="rounded-[14px] bg-[color:var(--vm-color-brand-blue)]/[.055] p-4"><dt className="text-[10px] text-[color:var(--vm-color-ink-muted)]">Área</dt><dd className="mt-1 text-sm font-bold">{project.area}</dd></div><div className="rounded-[14px] bg-[color:var(--vm-color-brand-blue)]/[.055] p-4"><dt className="text-[10px] text-[color:var(--vm-color-ink-muted)]">Espacios</dt><dd className="mt-1 text-sm font-bold">{project.rooms}</dd></div></dl>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-[1460px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="relative overflow-hidden rounded-[var(--vm-radius-elevated)] border border-[color:var(--vm-color-brand-blue)]/10 bg-[linear-gradient(135deg,#fff7bd,#eef8ff)] p-8 text-[color:var(--vm-color-brand-blue-deep)] shadow-[var(--vm-shadow-medium)] sm:p-12 lg:flex lg:items-end lg:justify-between lg:gap-12 lg:p-16">
            <div><div className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--vm-color-brand-blue)]">Tu siguiente paso</div><h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[.96] tracking-[-.05em] sm:text-6xl">Tu búsqueda puede empezar con una conversación.</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--vm-color-ink-muted)]">En pocos minutos podrás entender qué opciones podrían ajustarse a ti y cuál es el mejor siguiente paso.</p></div>
            <Link href="/demo" className="mt-8 inline-flex min-h-13 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--vm-color-brand-blue)] px-7 text-sm font-bold text-white transition hover:bg-[color:var(--vm-color-brand-blue-deep)] lg:mt-0 lg:w-auto">Empezar mi orientación <Icon name="arrow" className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-[color:var(--vm-color-brand-blue)]/10 px-5 py-8 text-xs text-[color:var(--vm-color-ink-muted)] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1460px] flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <span>Prototipo presentado para el Reto de Vivienda Colsubsidio × 30X.</span>
          <a href="https://www.colsubsidio.com/transparencia-acceso-informacion/tratamiento-datos-personales" className="font-semibold text-[color:var(--vm-color-brand-blue)] underline-offset-4 hover:underline">Tratamiento de información</a>
        </div>
      </footer>
    </div>
  );
}
