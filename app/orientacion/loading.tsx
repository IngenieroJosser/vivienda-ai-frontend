export default function OrientationLoading() {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="min-h-screen bg-[color:var(--vm-color-canvas)]"
    >
      <div className="h-[62px] border-b border-[color:var(--vm-color-line)] bg-white" />
      <main className="mx-auto max-w-[760px] space-y-5 px-4 py-7 sm:px-6">
        <div className="h-20 w-[78%] animate-pulse rounded-[18px] bg-white" />
        <div className="ml-auto h-16 w-[62%] animate-pulse rounded-[18px] bg-[color:var(--vm-color-brand-blue)]/10" />
        <div className="h-24 w-[82%] animate-pulse rounded-[18px] bg-white" />
      </main>
      <span className="sr-only">Cargando la orientación</span>
    </div>
  );
}
