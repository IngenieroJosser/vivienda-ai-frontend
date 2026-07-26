"use client";

import { RouteError } from "@/components/route-error";

export default function HousingError({ reset }: { reset: () => void }) {
  return (
    <RouteError
      title="No pudimos cargar los proyectos."
      description="La orientación y el avance local no fueron modificados. Intenta cargar nuevamente el catálogo."
      reset={reset}
    />
  );
}
