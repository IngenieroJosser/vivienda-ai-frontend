"use client";

import { Icon } from "./icon";

export function RouteError({
  title,
  description,
  reset,
}: {
  title: string;
  description: string;
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-10">
      <section role="alert" className="surface-solid w-full max-w-lg p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-700">
          <Icon name="alert" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--vm-color-ink-muted)]">
          {description}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 min-h-12 rounded-full bg-[color:var(--vm-color-brand-blue)] px-6 text-sm font-bold text-white"
        >
          Intentar nuevamente
        </button>
      </section>
    </main>
  );
}
