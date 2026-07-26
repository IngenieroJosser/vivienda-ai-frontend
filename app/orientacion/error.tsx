"use client";

import { RouteError } from "@/components/route-error";

export default function OrientationError({ reset }: { reset: () => void }) {
  return (
    <RouteError
      title="No pudimos cargar tu orientación."
      description="Tu avance local no fue eliminado. Intenta cargar nuevamente la conversación o el resultado."
      reset={reset}
    />
  );
}
