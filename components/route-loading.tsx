import { ProductBrand } from "./brand";

export function RouteLoading({ portal = false, embedded = false }: { portal?: boolean; embedded?: boolean }) {
  if (portal) {
    return (
      <div className="route-loading" aria-label="Cargando contenido" aria-live="polite">
        <div className="h-40 animate-pulse rounded-[28px] border border-[color:var(--vm-color-line)] bg-white/80" />
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[22px] border border-[color:var(--vm-color-line)] bg-white/90" />
          ))}
        </div>
        <div className="mt-5 h-80 animate-pulse rounded-[26px] border border-[color:var(--vm-color-line)] bg-white/90" />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] max-w-[1460px] px-5 py-8 sm:px-8 lg:px-12">
      {!embedded ? (
        <div className="mb-8 flex items-center justify-between">
          <ProductBrand compact />
          <span className="h-9 w-28 animate-pulse rounded-full bg-[color:var(--vm-color-orientation-wash)]" />
        </div>
      ) : null}
      <div className="grid gap-7 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="h-80 animate-pulse rounded-[28px] border border-[color:var(--vm-color-line)] bg-white/90" />
        <div className="h-[520px] animate-pulse rounded-[28px] border border-[color:var(--vm-color-line)] bg-white/95" />
      </div>
    </main>
  );
}
